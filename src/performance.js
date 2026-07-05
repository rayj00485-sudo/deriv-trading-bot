/**
 * Performance Metrics Tracker
 * Tracks bot performance over time
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const metricsFile = path.join(__dirname, '..', 'logs', 'metrics.json');

class PerformanceTracker {
  constructor() {
    this.metrics = this.loadMetrics();
  }

  loadMetrics() {
    try {
      if (fs.existsSync(metricsFile)) {
        const data = fs.readFileSync(metricsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error.message);
    }

    return {
      startTime: new Date().toISOString(),
      totalWins: 0,
      totalLosses: 0,
      totalProfit: 0,
      totalTrades: 0,
      largestWin: 0,
      largestLoss: 0,
      trades: [],
    };
  }

  recordTrade(tradeResult) {
    const { profit, martingaleSteps, signal } = tradeResult;

    this.metrics.totalTrades++;

    if (profit > 0) {
      this.metrics.totalWins++;
      this.metrics.totalProfit += profit;
      this.metrics.largestWin = Math.max(this.metrics.largestWin, profit);
    } else {
      this.metrics.totalLosses++;
      this.metrics.totalProfit += profit;
      this.metrics.largestLoss = Math.min(this.metrics.largestLoss, profit);
    }

    this.metrics.trades.push({
      timestamp: new Date().toISOString(),
      profit,
      martingaleSteps,
      signal,
    });

    this.saveMetrics();
  }

  saveMetrics() {
    try {
      const dir = path.dirname(metricsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error.message);
    }
  }

  getReport() {
    const winRate =
      this.metrics.totalTrades > 0
        ? ((this.metrics.totalWins / this.metrics.totalTrades) * 100).toFixed(2)
        : 0;

    const avgProfit =
      this.metrics.totalTrades > 0
        ? (this.metrics.totalProfit / this.metrics.totalTrades).toFixed(2)
        : 0;

    return {
      startTime: this.metrics.startTime,
      totalTrades: this.metrics.totalTrades,
      wins: this.metrics.totalWins,
      losses: this.metrics.totalLosses,
      winRate: `${winRate}%`,
      totalProfit: `$${this.metrics.totalProfit.toFixed(2)}`,
      avgProfitPerTrade: `$${avgProfit}`,
      largestWin: `$${this.metrics.largestWin.toFixed(2)}`,
      largestLoss: `$${this.metrics.largestLoss.toFixed(2)}`,
    };
  }
}

export default PerformanceTracker;
