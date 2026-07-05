import { logger } from './logger.js';
import { config } from './config.js';

/**
 * Bot Status Monitor
 * Shows real-time bot status
 */

const statusMessages = [
  '🔍 Checking signal detection...',
  '📊 Monitoring ticks...',
  '💰 Checking balance...',
  '📈 Analyzing pattern...',
  '⏳ Waiting for condition...',
];

let currentStatus = null;

export function updateStatus(newStatus) {
  currentStatus = newStatus;
  displayStatus();
}

function displayStatus() {
  if (!currentStatus) return;

  const status = currentStatus;
  const timestamp = new Date().toLocaleTimeString();

  console.clear();
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 DERIV TRADING BOT - STATUS MONITOR');
  console.log('═'.repeat(60));
  console.log(`⏰ ${timestamp}\n`);

  console.log('📊 CONFIGURATION:');
  console.log(`  Asset: ${config.trading.asset}`);
  console.log(`  Initial Stake: $${config.trading.initialStake}`);
  console.log(`  Martingale Multiplier: ${config.trading.martingaleMultiplier}x`);
  console.log(`  Max Steps: ${config.trading.maxMartingaleSteps}`);
  console.log(`  Loss Threshold: $${config.trading.lossThreshold}`);
  console.log('');

  console.log('💰 ACCOUNT:');
  console.log(`  Balance: $${status.balance}`);
  console.log(`  Mode: ${config.deriv.mode.toUpperCase()}`);
  console.log('');

  const strategy = status.strategy;
  console.log('🎯 STRATEGY STATE:');
  console.log(`  State: ${strategy.state}`);
  console.log(`  Signal: ${strategy.signal || 'None detected'}`);
  console.log(`  Martingale Step: ${strategy.martingaleStep}/${config.trading.maxMartingaleSteps}`);
  console.log(`  Current Stake: $${strategy.currentStake}`);
  console.log(`  Total Loss: $${strategy.totalLoss}`);
  console.log(`  Trade Count: ${strategy.tradeCount}`);
  console.log(`  Recent Ticks: [${strategy.recentTicks.join(', ')}]`);
  console.log('');

  console.log('📊 MARKET:');
  console.log(`  Pending Contracts: ${status.pendingContracts}`);
  console.log('');

  console.log('═'.repeat(60));
  console.log('Press Ctrl+C to stop the bot');
  console.log('═'.repeat(60) + '\n');
}

export const monitor = {
  start: () => {
    logger.info('Status monitor started');
  },
  stop: () => {
    logger.info('Status monitor stopped');
  },
};
