import { config } from './config.js';
import { exchangeCodeForToken } from './auth.js';
import { logger } from './logger.js';

const authCode = process.argv[2];
const codeVerifier = process.argv[3];

if (!authCode || !codeVerifier) {
  console.log('\n❌ Usage: node src/exchange-token.js <AUTH_CODE> <CODE_VERIFIER>');
  console.log('\nGet these from:');
  console.log('1. Run: node src/oauth-setup.js');
  console.log('2. Authorize and get the code from redirect URL');
  console.log('3. Use the code verifier from the setup output\n');
  process.exit(1);
}

async function exchangeToken() {
  try {
    logger.info('🔄 Exchanging authorization code for access token...');
    
    const accessToken = await exchangeCodeForToken(
      config.deriv.clientId,
      authCode,
      codeVerifier,
      config.deriv.redirectUri
    );

    logger.success('✅ Access token obtained!');
    console.log('\n' + '='.repeat(60));
    console.log('ACCESS TOKEN:');
    console.log(accessToken);
    console.log('='.repeat(60));
    console.log('\n📝 Update your .env file with:');
    console.log(`ACCESS_TOKEN=${accessToken}`);
    console.log('\nThen run: npm start\n');
  } catch (error) {
    logger.error('Failed to exchange token', { message: error.message });
    process.exit(1);
  }
}

exchangeToken();
