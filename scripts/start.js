#!/usr/bin/env node

/**
 * Bot Starter Script
 * Simple launcher with pre-flight checks
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n' + '='.repeat(60));
console.log('🤖 DERIV TRADING BOT LAUNCHER');
console.log('='.repeat(60));

// Check .env exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.error('\n❌ .env file not found!');
  console.error('   1. Copy: cp .env.example .env');
  console.error('   2. Edit with your credentials');
  console.error('   3. Run: npm start\n');
  process.exit(1);
}

console.log('✅ Configuration file found');

// Check dependencies
console.log('🔍 Checking dependencies...');
try {
  execSync('npm list ws node-fetch dotenv > /dev/null 2>&1');
  console.log('✅ All dependencies installed');
} catch (error) {
  console.warn('⚠️  Installing dependencies...');
  execSync('npm install');
  console.log('✅ Dependencies installed');
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('📁 Logs directory created');
}

console.log('\n' + '='.repeat(60));
console.log('Starting bot in 3 seconds...');
console.log('Press Ctrl+C to stop');
console.log('View logs: tail -f logs/info-*.log');
console.log('='.repeat(60) + '\n');

setTimeout(() => {
  execSync('node src/bot.js', { stdio: 'inherit' });
}, 3000);
