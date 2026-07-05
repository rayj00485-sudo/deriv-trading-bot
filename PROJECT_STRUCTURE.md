# Deriv Trading Bot - Complete Project Structure

```
deriv-trading-bot/
├── src/
│   ├── bot.js                    # Main bot entry point
│   ├── strategy.js               # Trading strategy implementation
│   ├── websocket.js              # WebSocket connection manager
│   ├── auth.js                   # OAuth2 authentication
│   ├── config.js                 # Configuration loader
│   ├── logger.js                 # Logging utility
│   ├── monitor.js                # Status monitoring
│   ├── performance.js            # Performance tracking
│   ├── oauth-setup.js            # OAuth2 setup helper
│   ├── exchange-token.js         # Token exchange utility
│   ├── get-account.js            # Account fetcher
│   ├── refresh-token.js          # Token refresh utility
│   ├── backtest.js               # Backtesting framework
│   ├── SETUP_GUIDE.js            # Setup documentation
│   └── API_REFERENCE.js          # API documentation
├── scripts/
│   ├── health-check.js           # Configuration verification
│   └── performance-report.js     # Performance metrics
├── logs/                          # Bot output logs (auto-created)
├── .env.example                  # Environment template
├── .env                          # Environment variables (PRIVATE)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── README.md                     # Main documentation
├── QUICKSTART.md                 # Quick start guide
└── install.sh                    # Installation script
```

## Key Files Explained

### Core Bot Files

**src/bot.js**
- Main bot logic
- WebSocket connection management
- Message handling
- Trade execution
- Contract monitoring

**src/strategy.js**
- 15-digit signal detection
- Martingale step management
- State machine (SIGNAL_DETECTION → MARTINGALE)
- Trade parameters generation

**src/websocket.js**
- WebSocket connection wrapper
- Message routing
- Auto-reconnection with backoff
- Ping keep-alive

**src/auth.js**
- OAuth2 PKCE flow
- Token exchange
- OTP URL generation

### Utilities

**src/oauth-setup.js**
- Generates authorization URL
- Guides through manual OAuth flow
- Outputs code verifier for token exchange

**src/exchange-token.js**
- Takes authorization code and verifier
- Exchanges for access token
- Saves token to .env

**src/get-account.js**
- Lists all your Deriv accounts
- Shows demo/live status
- Outputs account ID to use

**src/refresh-token.js**
- Refreshes expired access tokens
- Updates .env with new token

**scripts/health-check.js**
- Verifies configuration
- Tests OAuth connectivity
- Confirms WebSocket access

**scripts/performance-report.js**
- Shows trading statistics
- Calculates win rate
- Displays profit/loss metrics

### Configuration & Logging

**src/config.js**
- Loads .env variables
- Validates required fields
- Provides typed config object

**src/logger.js**
- Colored console output
- File-based logging
- Separate logs for trades, errors, info

**logs/**
- `info-YYYY-MM-DD.log` - General logs
- `trades-YYYY-MM-DD.log` - Trade records
- `error-YYYY-MM-DD.log` - Error logs
- `metrics.json` - Performance metrics

## Environment Variables (.env)

```
# Deriv OAuth2 Credentials
DERIV_CLIENT_ID=your_client_id
DERIV_APP_ID=your_app_id
DERIV_REDIRECT_URI=http://localhost:3000/callback

# Trading Account
ACCESS_TOKEN=your_oauth_token
ACCOUNT_ID=your_account_id
TRADING_MODE=demo

# Strategy Parameters
INITIAL_STAKE=0.35
MARTINGALE_MULTIPLIER=1.48
MAX_MARTINGALE_STEPS=12
ASSET=1HZ100V
PROFIT_THRESHOLD=100
LOSS_THRESHOLD=3000
```

## Quick Commands

```bash
# Setup
npm install
cp .env.example .env

# Get OAuth Token
node src/oauth-setup.js
node src/exchange-token.js <CODE> <VERIFIER>

# Get Account ID
node src/get-account.js

# Health Check
node scripts/health-check.js

# Start Bot
npm start

# View Performance
node scripts/performance-report.js
```

## Message Flow

```
User Start Bot
    ↓
Load Configuration
    ↓
OAuth2 Get OTP URL
    ↓
WebSocket Connect (with OTP)
    ↓
Subscribe to Ticks
    ↓
Get Account Balance
    ↓
╔═══════════════════════════════════════╗
║   SIGNAL DETECTION LOOP               ║
║   - Receive tick                      ║
║   - Add to 15-digit buffer            ║
║   - Check if condition met            ║
║   - Transition to MARTINGALE if yes   ║
╚═══════════════════════════════════════╝
    ↓
╔═══════════════════════════════════════╗
║   MARTINGALE TRADING LOOP             ║
║   - Receive tick                      ║
║   - Request proposal (quote)          ║
║   - Receive proposal with price       ║
║   - Auto-buy contract                 ║
║   - Monitor contract                  ║
║   - On settlement: Win or Loss        ║
║   - If loss: Increase stake (×1.48)  ║
║   - If win or 12 steps: Reset         ║
╚═══════════════════════════════════════╝
```

## API Endpoints Used

```
OAuth2:
  POST https://auth.deriv.com/oauth2/token

WebSocket:
  wss://api.derivws.com/trading/v1/options/ws/demo?otp=...

REST (for OTP):
  POST https://api.derivws.com/trading/v1/options/accounts/{id}/otp
```

## WebSocket Message Types

- `ticks` - Live price updates
- `balance` - Account balance
- `proposal` - Contract quotes
- `buy` - Contract purchase confirmation
- `proposal_open_contract` - Contract status updates
- `sell` - Contract close confirmation
- `ping`/`pong` - Keep-alive

