#!/usr/bin/env node

/**
 * Performance Report Generator
 * Shows detailed bot performance metrics
 */

import PerformanceTracker from './performance.js';
import { logger } from './logger.js';

const tracker = new PerformanceTracker();
const report = tracker.getReport();

console.log('\n' + '═'.repeat(60));
console.log('📊 DERIV TRADING BOT - PERFORMANCE REPORT');
console.log('═'.repeat(60));
console.log(`\nSession Start: ${report.startTime}`);
console.log(`\n📈 Trading Statistics:`);
console.log(`   Total Trades: ${report.totalTrades}`);
console.log(`   Wins: ${report.wins}`);
console.log(`   Losses: ${report.losses}`);
console.log(`   Win Rate: ${report.winRate}`);
console.log(`\n💰 Profit & Loss:`);
console.log(`   Total Profit: ${report.totalProfit}`);
console.log(`   Avg Per Trade: ${report.avgProfitPerTrade}`);
console.log(`   Largest Win: ${report.largestWin}`);
console.log(`   Largest Loss: ${report.largestLoss}`);
console.log('\n' + '═'.repeat(60) + '\n');
