#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies bot configuration and connectivity
 */

import { config, validateConfig } from './config.js';
import { getOTPURL } from './auth.js';
import { logger } from './logger.js';

async function healthCheck() {
  console.log('\n🏥 Deriv Trading Bot - Health Check');
  console.log('═'.repeat(50) + '\n');

  // 1. Configuration
  console.log('1️⃣  Configuration...');
  try {
    validateConfig();
    console.log('   ✅ All environment variables present\n');
  } catch (error) {
    console.log(`   ❌ ${error.message}\n`);
    process.exit(1);
  }

  // 2. WebSocket Authentication
  console.log('2️⃣  WebSocket Authentication...');
  try {
    const otpUrl = await getOTPURL(
      config.deriv.accountId,
      config.deriv.appId,
      config.deriv.token
    );
    console.log('   ✅ OTP URL obtained successfully');
    console.log(`   📍 ${otpUrl.substring(0, 50)}...\n`);
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
    console.log('   💡 Verify ACCESS_TOKEN is valid\n');
    process.exit(1);
  }

  // 3. Configuration Summary
  console.log('3️⃣  Configuration Summary:');
  console.log(`   Trading Mode: ${config.deriv.mode}`);
  console.log(`   Asset: ${config.trading.asset}`);
  console.log(`   Initial Stake: $${config.trading.initialStake}`);
  console.log(`   Martingale: ${config.trading.martingaleMultiplier}x over ${config.trading.maxMartingaleSteps} steps`);
  console.log(`   Loss Threshold: $${config.trading.lossThreshold}`);
  console.log(`   Profit Threshold: $${config.trading.profitThreshold}\n`);

  console.log('═'.repeat(50));
  console.log('✅ Health check passed! Bot is ready to start.');
  console.log('\nRun: npm start\n');
}

healthCheck().catch(error => {
  logger.error('Health check failed', { message: error.message });
  process.exit(1);
});
