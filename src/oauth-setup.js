import { config } from './config.js';
import { getAuthorizationURL, generatePKCE } from './auth.js';
import { logger } from './logger.js';

/**
 * Manual OAuth2 Flow Setup
 * Run this script to get your first access token
 */

const clientId = config.deriv.clientId;
const redirectUri = config.deriv.redirectUri;

if (!clientId || !redirectUri) {
  logger.error('Missing DERIV_CLIENT_ID or DERIV_REDIRECT_URI in .env');
  process.exit(1);
}

const { codeVerifier, codeChallenge } = generatePKCE();
const state = require('crypto').randomBytes(16).toString('hex');

const authUrl = getAuthorizationURL(clientId, redirectUri, codeChallenge, state);

console.log('\n🔐 OAuth2 Authorization Setup');
console.log('================================\n');
console.log('1. Open this link in your browser:');
console.log(`\n${authUrl}\n`);
console.log('2. Log in with your Deriv account');
console.log('3. Accept the permissions');
console.log('4. You will be redirected to a URL like:');
console.log('   http://localhost:3000/callback?code=XXXXXX&state=XXXXXX');
console.log('\n5. Copy the "code" parameter and run:');
console.log('   node src/exchange-token.js <CODE_HERE>');
console.log('\n6. Save the returned access_token to your .env file');
console.log('\n⚠️  Save this code verifier securely (used for token exchange):');
console.log(`   ${codeVerifier}\n`);
