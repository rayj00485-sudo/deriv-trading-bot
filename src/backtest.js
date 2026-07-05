/**
 * Backtesting Framework
 * Test your strategy on historical data
 */

import { logger } from './logger.js';
import TradingStrategy from './strategy.js';
import { config } from './config.js';

// Sample historical ticks (replace with real data from Deriv)
const SAMPLE_TICKS = [
  3, 7, 4, 5, 0, 2, 5, 7, 5, 7, 8, 3, 9, 7, 0, // 15 digits
  2, 1, 8, 9, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, // Over 6 pattern
  8, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, // Continuation
  8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, // No pattern
];

function backtestStrategy() {
  logger.info('🧪 Starting backtest...');

  const strategy = new TradingStrategy(config);
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;

  console.log('\n📊 Backtest Results:');
  console.log('=' + '='.repeat(59));

  for (let i = 0; i < SAMPLE_TICKS.length; i++) {
    const digit = SAMPLE_TICKS[i];
    strategy.addTick(digit);

    // Simulate trade if in martingale state
    if (strategy.state === 'MARTINGALE' && i > 14) {
      // Simulate win/loss randomly
      const willWin = Math.random() > 0.5;
      const stake = strategy.currentStake;

      if (willWin) {
        const profit = stake * 2;
        totalProfit += profit;
        wins++;
        logger.success(`Win at tick ${i}: +$${profit}`);
        strategy.onTradeWin(profit);
      } else {
        losses++;
        logger.warn(`Loss at tick ${i}: -$${stake}`);
        strategy.onTradeLoss(stake);
      }
    }
  }

  console.log('=' + '='.repeat(59));
  console.log(`\n📈 Final Results:`);
  console.log(`   Wins: ${wins}`);
  console.log(`   Losses: ${losses}`);
  console.log(`   Total Profit: $${totalProfit}`);
  console.log(`   Win Rate: ${wins > 0 ? ((wins / (wins + losses)) * 100).toFixed(2) : 0}%`);
  console.log('\n');
}

if (process.argv[2] === '--run') {
  backtestStrategy();
} else {
  console.log('Backtest utility for Deriv Trading Bot');
  console.log('\nUsage: node src/backtest.js --run');
}

export { backtestStrategy };
