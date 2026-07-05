#!/usr/bin/env node

import fetch from 'node-fetch';
import crypto from 'crypto';
import { logger } from './logger.js';

/**
 * Token Refresh Utility
 * Refreshes expired access tokens (if supported by Deriv)
 */

const refreshToken = process.env.REFRESH_TOKEN;

if (!refreshToken) {
  logger.error('No REFRESH_TOKEN in .env');
  logger.warn('Note: Deriv OAuth2 may not support refresh tokens');
  logger.info('Generate a new token: node src/oauth-setup.js');
  process.exit(1);
}

async function refreshAccessToken() {
  try {
    logger.info('🔄 Attempting to refresh access token...');

    const response = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.statusText}`);
    }

    const data = await response.json();

    logger.success('✅ Token refreshed successfully!');
    console.log('\n' + '='.repeat(60));
    console.log('NEW ACCESS TOKEN:');
    console.log(data.access_token);
    console.log('='.repeat(60));
    console.log('\n📝 Update your .env file with:');
    console.log(`ACCESS_TOKEN=${data.access_token}`);
    console.log(`REFRESH_TOKEN=${data.refresh_token || refreshToken}`);
    console.log('\nThen restart the bot\n');
  } catch (error) {
    logger.error('Token refresh failed', { message: error.message });
    logger.info('Generate a new token: node src/oauth-setup.js');
    process.exit(1);
  }
}

refreshAccessToken();
