import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Deriv OAuth2
  deriv: {
    clientId: process.env.DERIV_CLIENT_ID,
    redirectUri: process.env.DERIV_REDIRECT_URI,
    appId: process.env.DERIV_APP_ID,
    token: process.env.ACCESS_TOKEN,
    accountId: process.env.ACCOUNT_ID,
    mode: process.env.TRADING_MODE || 'demo',
  },

  // Trading Parameters
  trading: {
    initialStake: parseFloat(process.env.INITIAL_STAKE) || 0.35,
    martingaleMultiplier: parseFloat(process.env.MARTINGALE_MULTIPLIER) || 1.48,
    maxMartingaleSteps: parseInt(process.env.MAX_MARTINGALE_STEPS) || 12,
    asset: process.env.ASSET || '1HZ100V',
    profitThreshold: parseFloat(process.env.PROFIT_THRESHOLD) || 100,
    lossThreshold: parseFloat(process.env.LOSS_THRESHOLD) || 3000,
  },

  // Contract Settings
  contract: {
    durationUnit: 't', // ticks
    duration: 1,
    basis: 'stake',
    currency: 'USD',
  },

  // Signal Detection
  signal: {
    consecutiveDigits: 15,
    underThreshold: 3,
    overThreshold: 6,
  },

  // WebSocket
  ws: {
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    pingInterval: 30000,
  },
};

export function validateConfig() {
  const required = ['DERIV_CLIENT_ID', 'DERIV_APP_ID', 'ACCESS_TOKEN', 'ACCOUNT_ID'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('📋 Copy .env.example to .env and fill in your credentials');
    process.exit(1);
  }

  console.log('✅ Configuration validated');
}
