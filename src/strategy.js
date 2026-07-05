import { logger } from './logger.js';

class TradingStrategy {
  constructor(config) {
    this.config = config;
    this.ticks = []; // Store last 15 ticks
    this.state = 'SIGNAL_DETECTION'; // SIGNAL_DETECTION or MARTINGALE
    this.signal = null; // 'UNDER' or 'OVER'
    this.martingaleStep = 0;
    this.currentStake = config.trading.initialStake;
    this.totalLoss = 0;
    this.tradeCount = 0;
    this.openContracts = [];
  }

  /**
   * Add a new tick and check for signals
   */
  addTick(digit) {
    this.ticks.push(digit);
    if (this.ticks.length > 15) {
      this.ticks.shift();
    }

    if (this.state === 'SIGNAL_DETECTION' && this.ticks.length === 15) {
      this.checkSignal();
    }
  }

  /**
   * Check if 15 consecutive ticks meet signal criteria
   */
  checkSignal() {
    const allGreaterThan3 = this.ticks.every(tick => tick > 3);
    const allLessThan6 = this.ticks.every(tick => tick < 6);

    if (allGreaterThan3) {
      this.signal = 'UNDER';
      this.state = 'MARTINGALE';
      this.martingaleStep = 1;
      this.currentStake = this.config.trading.initialStake;
      logger.success('🎯 SIGNAL DETECTED: UNDER 3', {
        ticks: this.ticks,
        readyToTradeOnNextTick: true,
      });
      return true;
    } else if (allLessThan6) {
      this.signal = 'OVER';
      this.state = 'MARTINGALE';
      this.martingaleStep = 1;
      this.currentStake = this.config.trading.initialStake;
      logger.success('🎯 SIGNAL DETECTED: OVER 6', {
        ticks: this.ticks,
        readyToTradeOnNextTick: true,
      });
      return true;
    }

    return false;
  }

  /**
   * Get next trade parameters
   */
  getNextTrade() {
    if (this.state !== 'MARTINGALE') {
      return null;
    }

    const trade = {
      contractType: this.signal === 'UNDER' ? 'PUT' : 'CALL',
      stake: this.currentStake,
      martingaleStep: this.martingaleStep,
      signal: this.signal,
    };

    logger.info(`📊 Trade Step ${this.martingaleStep}/${this.config.trading.maxMartingaleSteps}`, {
      contractType: trade.contractType,
      stake: trade.stake,
    });

    return trade;
  }

  /**
   * Handle trade loss
   */
  onTradeLoss(loss) {
    this.totalLoss += loss;
    this.tradeCount++;

    logger.warn(`❌ Trade Lost - Step ${this.martingaleStep}`, {
      loss,
      totalLoss: this.totalLoss,
      martingaleStep: this.martingaleStep,
    });

    // Check if we've hit max martingale steps
    if (this.martingaleStep >= this.config.trading.maxMartingaleSteps) {
      logger.warn('⚠️ Max martingale steps reached (12), resetting...');
      this.resetMartingale();
      return;
    }

    // Update stake for next step
    if (this.martingaleStep <= 2) {
      // Steps 1-2: Keep stake at 0.35
      this.currentStake = this.config.trading.initialStake;
    } else {
      // Steps 3+: Apply 1.48 multiplier
      this.currentStake = parseFloat((this.currentStake * this.config.trading.martingaleMultiplier).toFixed(2));
    }

    this.martingaleStep++;
  }

  /**
   * Handle trade win
   */
  onTradeWin(profit) {
    this.tradeCount++;
    logger.success(`✅ Trade Won!`, {
      profit,
      martingaleStep: this.martingaleStep,
      totalTradesInSequence: this.tradeCount,
      totalLoss: this.totalLoss,
      netProfit: profit - this.totalLoss,
    });

    logger.trade({
      timestamp: new Date().toISOString(),
      signal: this.signal,
      martingaleSteps: this.martingaleStep,
      profit,
      totalLoss: this.totalLoss,
      netProfit: profit - this.totalLoss,
    });

    // Check loss threshold
    if (this.totalLoss >= this.config.trading.lossThreshold) {
      logger.error('🛑 LOSS THRESHOLD EXCEEDED', {
        totalLoss: this.totalLoss,
        threshold: this.config.trading.lossThreshold,
      });
      return { stop: true, reason: 'loss_threshold_exceeded' };
    }

    this.reset();
    return { stop: false };
  }

  /**
   * Reset martingale for new signal
   */
  resetMartingale() {
    this.martingaleStep = 1;
    this.currentStake = this.config.trading.initialStake;
    logger.info('🔄 Martingale reset after max steps');
  }

  /**
   * Full reset to signal detection
   */
  reset() {
    this.state = 'SIGNAL_DETECTION';
    this.signal = null;
    this.martingaleStep = 0;
    this.currentStake = this.config.trading.initialStake;
    this.totalLoss = 0;
    this.tradeCount = 0;
    this.ticks = [];
    logger.info('🔄 Strategy reset - back to signal detection');
  }

  getStatus() {
    return {
      state: this.state,
      signal: this.signal,
      martingaleStep: this.martingaleStep,
      currentStake: this.currentStake,
      totalLoss: this.totalLoss,
      tradeCount: this.tradeCount,
      recentTicks: this.ticks.slice(-5),
    };
  }
}

export default TradingStrategy;
