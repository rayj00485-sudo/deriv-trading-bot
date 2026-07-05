import fetch from 'node-fetch';
import { config } from './config.js';
import { logger } from './logger.js';

/**
 * Get Account ID for trading
 * Run this after you have an access token
 */

async function getAccounts() {
  try {
    logger.info('📁 Fetching your Deriv accounts...');

    const response = await fetch(
      'https://api.derivws.com/trading/v1/options/accounts',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.deriv.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      logger.error('No accounts found');
      return;
    }

    console.log('\n💳 Your Deriv Accounts:');
    console.log('========================\n');

    data.data.forEach((account, index) => {
      console.log(`Account ${index + 1}:`);
      console.log(`  ID: ${account.account_id}`);
      console.log(`  Type: ${account.account_type}`);
      console.log(`  Currency: ${account.currency}`);
      console.log(`  Virtual: ${account.is_virtual ? 'Yes (Demo)' : 'No (Real)'}`);
      console.log('');
    });

    console.log('\n📝 Update your .env file with:');
    console.log(`ACCOUNT_ID=${data.data[0].account_id}`);
    console.log('\nThen run: npm start\n');
  } catch (error) {
    logger.error('Failed to get accounts', { message: error.message });
    process.exit(1);
  }
}

getAccounts();
