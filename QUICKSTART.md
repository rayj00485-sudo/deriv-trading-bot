# Quick Start Guide

## Prerequisites
- Node.js 18+
- Deriv account (demo or live)
- OAuth2 credentials from Deriv

## Quick Setup (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/deriv-trading-bot.git
cd deriv-trading-bot
npm install
```

### 2. Get Deriv Credentials

**A. Register Your Application**
1. Go to https://app.deriv.com/account/applications
2. Click "Create a new app"
3. Set Redirect URL: `http://localhost:3000/callback`
4. Copy your CLIENT_ID and APP_ID

**B. Get Access Token**
```bash
node src/oauth-setup.js
```
- Open the link in your browser
- Log in with Deriv account
- Copy the authorization code
- Run: `node src/exchange-token.js <CODE> <VERIFIER>`
- Copy the access token

**C. Get Account ID**
```bash
node src/get-account.js
```

### 3. Configure .env
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
DERIV_CLIENT_ID=your_client_id
DERIV_APP_ID=your_app_id
ACCESS_TOKEN=your_access_token
ACCOUNT_ID=your_account_id
TRADING_MODE=demo
```

### 4. Start the Bot
```bash
npm start
```

Expected output:
```
✅ Configuration validated
🤖 Starting Deriv Trading Bot...
⚙️  Configuration loaded
🔐 Obtaining WebSocket authentication...
✅ WebSocket connected to Deriv
💰 Balance: 1000.00 USD
📊 Subscribing to ticks...
```

## Strategy Overview

### Signal Detection
- Monitors 15 consecutive ticks
- **UNDER Signal**: All 15 digits > 3 → Buy UNDER 3
- **OVER Signal**: All 15 digits < 6 → Buy OVER 6

### Martingale Execution
```
Step 1-2:  Stake = $0.35 (no multiplier)
Step 3-12: Stake *= 1.48 (compounding)
On Loss:   Move to next step
On Win:    Reset to signal detection
After 12:  Reset to $0.35, continue
```

### Risk Management
- Loss Threshold: $3000 (bot stops)
- Max Martingale Steps: 12
- Initial Stake: $0.35
- Multiplier: 1.48x

## Logs

All activity is logged to `logs/` directory:
- `info-YYYY-MM-DD.log` - General info
- `trades-YYYY-MM-DD.log` - Trade details
- `error-YYYY-MM-DD.log` - Errors

## Troubleshooting

### "Missing environment variables"
→ Check .env file has all required fields

### "WebSocket connection failed"
→ Verify ACCESS_TOKEN is valid (tokens expire)
→ Get a fresh token

### "No ticks received"
→ Symbol "1HZ100V" may not be available in your region
→ Check Deriv status page

### "Authorization failed"
→ Access token expired
→ Get a new token: `node src/oauth-setup.js`

## Files

- `src/bot.js` - Main bot logic
- `src/strategy.js` - Trading strategy
- `src/websocket.js` - WebSocket manager
- `src/auth.js` - OAuth2 authentication
- `src/config.js` - Configuration loader
- `src/logger.js` - Logging utility
- `.env.example` - Environment template

## Support

For Deriv API help: https://api.deriv.com/docs
For issues: Open a GitHub issue

## License

MIT
