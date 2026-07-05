import { config, validateConfig } from './config.js';
import { getOTPURL } from './auth.js';
import DerivWebSocket from './websocket.js';
import TradingStrategy from './strategy.js';
import { logger } from './logger.js';

class DerivTradingBot {
  constructor() {
    validateConfig();
    this.config = config;
    this.ws = null;
    this.strategy = new TradingStrategy(config);
    this.awaitingNextTick = false;
    this.contractsAwaitingSettlement = new Map();
    this.balance = 0;
  }

  async start() {
    try {
      logger.info('🤖 Starting Deriv Trading Bot...');
      logger.info('⚙️ Configuration loaded', {
        asset: this.config.trading.asset,
        initialStake: this.config.trading.initialStake,
        martingaleMultiplier: this.config.trading.martingaleMultiplier,
        maxSteps: this.config.trading.maxMartingaleSteps,
      });

      // Get WebSocket URL with OTP
      logger.info('🔐 Obtaining WebSocket authentication...');
      const otpUrl = await getOTPURL(
        this.config.deriv.accountId,
        this.config.deriv.appId,
        this.config.deriv.token
      );

      // Connect to WebSocket
      this.ws = new DerivWebSocket(
        otpUrl,
        this.handleMessage.bind(this),
        this.handleError.bind(this)
      );

      await this.ws.connect();

      // Request balance
      await this.getBalance();

      // Subscribe to ticks
      this.subscribeToTicks();

      logger.success('🚀 Bot started successfully');
    } catch (error) {
      logger.error('Failed to start bot', { message: error.message });
      process.exit(1);
    }
  }

  async getBalance() {
    return new Promise((resolve) => {
      const reqId = this.ws.send({
        balance: 1,
        subscribe: 1,
      });

      const originalOnMessage = this.ws.onMessage;
      this.ws.onMessage = (message) => {
        if (message.msg_type === 'balance') {
          this.balance = message.balance.balance;
          logger.info(`💰 Balance: ${this.balance} ${message.balance.currency}`);
          resolve();
        }
        originalOnMessage(message);
      };
    });
  }

  subscribeToTicks() {
    logger.info('📊 Subscribing to ticks...');
    this.ws.subscribe({
      ticks: this.config.trading.asset,
      subscribe: 1,
    });
  }

  handleMessage(message) {
    try {
      // Handle ticks
      if (message.msg_type === 'tick') {
        const tick = message.tick;
        const digit = Math.floor(tick.quote) % 10;
        this.onNewTick(digit, tick);
      }

      // Handle proposals
      if (message.msg_type === 'proposal') {
        this.handleProposal(message.proposal);
      }

      // Handle buy response
      if (message.msg_type === 'buy') {
        this.handleBuyResponse(message.buy);
      }

      // Handle contract update
      if (message.msg_type === 'proposal_open_contract') {
        this.handleContractUpdate(message.proposal_open_contract);
      }

      // Handle balance update
      if (message.msg_type === 'balance') {
        this.balance = message.balance.balance;
      }
    } catch (error) {
      logger.error('Error handling message', { error: error.message, message });
    }
  }

  onNewTick(digit, tickData) {
    // Add tick to strategy
    this.strategy.addTick(digit);

    // If in martingale state and not awaiting next tick, place trade
    if (this.strategy.state === 'MARTINGALE' && !this.awaitingNextTick) {
      this.placeTrade();
    }
  }

  async placeTrade() {
    const tradeParams = this.strategy.getNextTrade();
    if (!tradeParams) return;

    this.awaitingNextTick = true;

    try {
      // Request proposal
      const contractType = tradeParams.contractType === 'UNDER' ? 'PAYOUT' : 'PAYOUT';
      const contractCondition = tradeParams.signal === 'UNDER' ? 'LT' : 'GT';

      this.ws.send({
        proposal: 1,
        amount: tradeParams.stake,
        basis: 'stake',
        contract_type: tradeParams.signal === 'UNDER' ? 'PUT' : 'CALL',
        currency: this.config.contract.currency,
        duration: this.config.contract.duration,
        duration_unit: this.config.contract.durationUnit,
        symbol: this.config.trading.asset,
        req_id: 1000 + this.strategy.martingaleStep,
      });
    } catch (error) {
      logger.error('Failed to place trade', { error: error.message });
      this.awaitingNextTick = false;
    }
  }

  handleProposal(proposal) {
    if (this.strategy.state !== 'MARTINGALE' || !this.awaitingNextTick) return;

    logger.info('📋 Proposal received', {
      askPrice: proposal.ask_price,
      expiryTime: proposal.expiry_time,
    });

    // Auto-buy the proposal
    this.ws.send({
      buy: proposal.id,
      price: proposal.ask_price,
      req_id: 2000 + this.strategy.martingaleStep,
    });
  }

  handleBuyResponse(buyData) {
    logger.success('✅ Contract Bought', {
      contractId: buyData.contract_id,
      stake: buyData.stake,
      askPrice: buyData.ask_price,
    });

    // Subscribe to contract updates
    this.contractsAwaitingSettlement.set(buyData.contract_id, {
      stake: buyData.stake,
      askPrice: buyData.ask_price,
    });

    this.ws.send({
      proposal_open_contract: 1,
      contract_id: buyData.contract_id,
      subscribe: 1,
      req_id: 3000 + this.strategy.martingaleStep,
    });
  }

  handleContractUpdate(contract) {
    if (!this.contractsAwaitingSettlement.has(contract.contract_id)) return;

    // Check if contract is settled
    if (contract.is_sold) {
      const contractInfo = this.contractsAwaitingSettlement.get(contract.contract_id);
      const profit = contract.profit || 0;

      logger.info('📊 Contract Settled', {
        contractId: contract.contract_id,
        status: contract.status,
        profit: profit,
        bid_price: contract.bid_price,
      });

      this.contractsAwaitingSettlement.delete(contract.contract_id);
      this.awaitingNextTick = false;

      // Handle win/loss
      if (profit > 0) {
        const stopResult = this.strategy.onTradeWin(profit);
        if (stopResult.stop) {
          logger.error('🛑 BOT STOPPING', { reason: stopResult.reason });
          this.stop();
        }
      } else if (profit < 0) {
        this.strategy.onTradeLoss(Math.abs(profit));
      } else {
        logger.warn('⚠️ Contract expired with no profit/loss');
        this.strategy.onTradeLoss(contractInfo.stake);
      }
    }
  }

  handleError(error) {
    logger.error('WebSocket error occurred', { message: error.message });
  }

  getStatus() {
    return {
      timestamp: new Date().toISOString(),
      balance: this.balance,
      strategy: this.strategy.getStatus(),
      pendingContracts: this.contractsAwaitingSettlement.size,
    };
  }

  stop() {
    logger.info('🛑 Stopping bot...');
    if (this.ws) {
      this.ws.close();
    }
    process.exit(0);
  }
}

// Main execution
const bot = new DerivTradingBot();
bot.start().catch((error) => {
  logger.error('Fatal error', { message: error.message });
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  bot.stop();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  bot.stop();
});
