# Deriv Trading Bot - Martingale Strategy

Automated trading bot for Deriv Options using WebSocket API with custom martingale strategy.

## Features

- **15-Digit Condition Detection**: Monitors 15 consecutive ticks to identify trading signals
- **12-Step Martingale**: Progressive stake increase with 1.48x multiplier
- **Live Tick Trading**: Buys on every tick following signal detection
- **OAuth2 Authentication**: Secure Deriv API integration
- **Auto Recovery**: Resets after wins or max losses

## Setup

### Prerequisites
- Node.js 18+
- Deriv account (demo or live)
- OAuth2 application credentials

### Installation

```bash
npm install
cp .env.example .env
```

### Configuration

Edit `.env` with your:
- `DERIV_CLIENT_ID` - From your Deriv app
- `DERIV_APP_ID` - From your Deriv app
- `ACCESS_TOKEN` - OAuth2 token
- `ACCOUNT_ID` - Your Deriv account ID

### Running the Bot

```bash
npm start
```

## Strategy Details

### Signal Detection
- Checks 15 consecutive ticks
- **UNDER Signal**: All 15 digits > 3 → Buy UNDER 3
- **OVER Signal**: All 15 digits < 6 → Buy OVER 6

### Martingale Rules
1. Step 1-2: Stake = 0.35 USD
2. Step 3-12: Stake *= 1.48 (compounding)
3. On loss after 12 steps: Reset to step 1 (0.35 USD)
4. On win: Reset to signal detection phase

## Files

- `src/bot.js` - Main bot logic
- `src/auth.js` - OAuth2 authentication
- `src/websocket.js` - WebSocket connection manager
- `src/strategy.js` - Trading strategy implementation
- `src/config.js` - Configuration loader

## Logs

Bot logs all trades, wins, losses, and errors to `logs/` directory.
