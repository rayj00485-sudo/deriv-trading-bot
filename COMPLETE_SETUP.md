# COMPLETE DEPLOYMENT & SETUP GUIDE

## 🚀 FULL SETUP IN 10 MINUTES

This guide covers everything from OAuth2 to running your bot.

---

## PART 1: PREREQUISITES (2 minutes)

### 1.1 Install Node.js
- Download: https://nodejs.org/ (version 18 or higher)
- Verify: `node -v` (should show v18+)
- Verify: `npm -v` (should show 8+)

### 1.2 Create Deriv Account
- Go to: https://app.deriv.com/
- Sign up or log in
- Ensure you have a trading account (demo or real)

---

## PART 2: GET OAUTH2 CREDENTIALS (3 minutes)

### 2.1 Register Your Application
1. Log into Deriv: https://app.deriv.com/account/applications
2. Click **"Create a new app"**
3. Fill in:
   - **App Name**: "Deriv Trading Bot" (or any name)
   - **Redirect URL**: `http://localhost:3000/callback`
   - **Scopes**: Check "trade"
4. Click **Create**
5. You'll see:
   - **Client ID** (copy this)
   - **App ID** (copy this)

### 2.2 Get Access Token

**Step A: Generate Authorization URL**
```bash
node src/oauth-setup.js
```

Output will show a URL. Copy it.

**Step B: Authorize in Browser**
1. Open the URL in your browser
2. Log in with your Deriv credentials
3. Click "Allow" to authorize
4. You'll be redirected to: `http://localhost:3000/callback?code=XXXXX&state=XXXXX`
5. Copy the entire `code` parameter (the long XXXXX part)

**Step C: Save the Code Verifier**
- The `oauth-setup.js` output shows a code verifier
- Save it somewhere (you'll need it in next step)

**Step D: Exchange Code for Token**
```bash
node src/exchange-token.js <CODE_FROM_STEP_B> <CODE_VERIFIER_FROM_STEP_C>
```

Example:
```bash
node src/exchange-token.js abc123def456xyz789 verifier123456
```

Output:
```
✅ Access token obtained!

============================================================
ACCESS TOKEN:
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
============================================================
```

Copy the entire token (the long string starting with `eyJ...`)

---

## PART 3: GET ACCOUNT ID (1 minute)

### 3.1 Update .env Temporarily
```bash
cp .env.example .env
```

Edit `.env` and add:
```
DERIV_CLIENT_ID=<from step 2.1>
DERIV_APP_ID=<from step 2.1>
ACCESS_TOKEN=<from step 2.2 Step D>
DERIV_REDIRECT_URI=http://localhost:3000/callback
```

### 3.2 Fetch Your Accounts
```bash
node src/get-account.js
```

Output:
```
🏦 Your Deriv Accounts:
========================

Account 1:
  ID: CR123456
  Type: demo
  Currency: USD
  Virtual: Yes (Demo)
```

Copy the account ID (e.g., `CR123456`)

---

## PART 4: COMPLETE .env CONFIGURATION (2 minutes)

### 4.1 Edit .env

Fill in all values:

```bash
# Deriv OAuth2 Credentials
DERIV_CLIENT_ID=your_client_id_from_step_2.1
DERIV_APP_ID=your_app_id_from_step_2.1
DERIV_REDIRECT_URI=http://localhost:3000/callback

# Trading Account
ACCESS_TOKEN=your_token_from_step_2.2
ACCOUNT_ID=your_account_id_from_step_3.2
TRADING_MODE=demo

# Strategy Parameters (YOUR CONFIGURATION)
INITIAL_STAKE=0.35
MARTINGALE_MULTIPLIER=1.48
MAX_MARTINGALE_STEPS=12
ASSET=1HZ100V
PROFIT_THRESHOLD=100
LOSS_THRESHOLD=3000
```

### 4.2 Verify Configuration

```bash
node scripts/health-check.js
```

Expected output:
```
🏥 Deriv Trading Bot - Health Check
══════════════════════════════════════════════

1️⃣  Configuration...
   ✅ All environment variables present

2️⃣  WebSocket Authentication...
   ✅ OTP URL obtained successfully
   📍 wss://api.derivws.com/trading/v1/options/ws/demo?otp=...

3️⃣  Configuration Summary:
   Trading Mode: demo
   Asset: 1HZ100V
   Initial Stake: $0.35
   Martingale: 1.48x over 12 steps
   Loss Threshold: $3000
   Profit Threshold: $100

══════════════════════════════════════════════
✅ Health check passed! Bot is ready to start.

Run: npm start
```

If you see errors:
- **Missing variables**: Fill in all .env fields
- **Authorization failed**: Token expired, get new one
- **WebSocket error**: Check account ID is correct

---

## PART 5: RUN THE BOT (1 minute)

### 5.1 Install Dependencies
```bash
npm install
```

### 5.2 Start the Bot
```bash
npm start
```

Expected output:
```
✅ Configuration validated
🤖 Starting Deriv Trading Bot...
⚙️  Configuration loaded
  Asset: 1HZ100V
  Initial Stake: $0.35
  Martingale Multiplier: 1.48x
  Max Steps: 12
  Loss Threshold: $3000
🔐 Obtaining WebSocket authentication...
✅ WebSocket connected to Deriv
💰 Balance: 1000.00 USD
📊 Subscribing to ticks...
```

Bot is now running! It will:
1. Monitor ticks
2. Wait for signal detection (15 consecutive digits pattern)
3. Start trading when signal occurs
4. Log all activity to `logs/` directory

---

## PART 6: MONITOR BOT PERFORMANCE

### 6.1 View Real-Time Logs
```bash
tail -f logs/info-$(date +%Y-%m-%d).log
```

### 6.2 View Trade History
```bash
cat logs/trades-$(date +%Y-%m-%d).log
```

### 6.3 View Performance Metrics
```bash
node scripts/performance-report.js
```

Output:
```
📊 DERIV TRADING BOT - PERFORMANCE REPORT
══════════════════════════════════════════════

Session Start: 2026-07-05T14:00:00.000Z

📈 Trading Statistics:
   Total Trades: 25
   Wins: 18
   Losses: 7
   Win Rate: 72%

💰 Profit & Loss:
   Total Profit: $450.50
   Avg Per Trade: $18.02
   Largest Win: $85.50
   Largest Loss: $-35.00

══════════════════════════════════════════════
```

---

## TROUBLESHOOTING

### ❌ "Missing environment variables"

**Solution:**
```bash
cp .env.example .env
# Edit .env and fill in all values
node scripts/health-check.js
```

### ❌ "Failed to get OTP"

**Cause:** Access token expired or invalid

**Solution:**
```bash
node src/oauth-setup.js
node src/exchange-token.js <NEW_CODE> <NEW_VERIFIER>
# Update ACCESS_TOKEN in .env
```

### ❌ "WebSocket connection failed"

**Cause:** Invalid credentials or account ID

**Solution:**
1. Verify ACCOUNT_ID:
```bash
node src/get-account.js
```
2. Verify ACCESS_TOKEN is fresh
3. Check Deriv API status: https://status.deriv.com

### ❌ "No ticks received"

**Cause:** Symbol not available in your region or market hours

**Solution:**
1. Check market hours: 24/5 for volatility indices
2. Try different symbol (see API_REFERENCE.js for options)
3. Ensure account has trading enabled

### ❌ "Stuck in signal detection"

**Cause:** 15-digit pattern hasn't occurred yet

**Solution:**
- Bot is working correctly, just waiting
- Takes time for specific pattern to appear
- Monitor logs to see recent ticks
- Check recent ticks in logs for debugging

### ⚠️ "Repeated reconnections"

**Cause:** Network instability or token expiration

**Solution:**
1. Check internet connection
2. Refresh token: `node src/refresh-token.js`
3. Restart bot: `npm start`

---

## STRATEGY EXPLANATION

### How the Bot Works

#### Phase 1: Signal Detection
```
📊 Monitor every tick
   ↓
🔍 Check last 15 consecutive ticks
   ↓
IF all 15 digits > 3:
   → Generate UNDER 3 signal
   → Start buying UNDER contracts
   
IF all 15 digits < 6:
   → Generate OVER 6 signal
   → Start buying OVER contracts
   
OTHERWISE:
   → Continue monitoring
```

#### Phase 2: Martingale Trading
```
🎯 Signal detected on ticks: [5,7,4,2,8,9,7,6,5,4,8,9,7,6,5]
   ↓
Step 1: Buy with stake $0.35
   ✗ Loss → Next Step
   ✓ Win → RESET to Signal Detection
   
Step 2: Buy with stake $0.35 (same)
   ✗ Loss → Next Step
   ✓ Win → RESET
   
Step 3: Buy with stake $0.35 × 1.48 = $0.52
   ✗ Loss → Next Step
   ✓ Win → RESET
   
Step 4: Buy with stake $0.52 × 1.48 = $0.77
   ✗ Loss → Continue...
   ✓ Win → RESET

... (steps 5-12 continue multiplying)

Step 12: Buy with calculated stake
   ✗ Loss → RESET to Step 1, keep trading
   ✓ Win → RESET to Signal Detection
   
RISK LIMIT:
   If total losses exceed $3000 → BOT STOPS
```

### Your Configuration

```
Asset:                  Volatility 100 Index (1HZ100V)
Initial Stake:          $0.35
Martingale Multiplier:  1.48x
Max Steps:              12
Duration:               1 tick per contract
Profit Threshold:       $100 (trigger point)
Loss Threshold:         $3000 (kill switch)
```

### Example Trade Sequence

```
Ticks received: [3,7,4,5,0,2,5,7,5,7,8,3,9,7,0,2,1,8,9,3,...]
                 └─ 15 digits check ─┘ (all > 3? all < 6?)
                                       
All > 3? YES → UNDER signal
                                       
                ↓ Next tick after signal
                
Trade 1: Stake $0.35 on UNDER 3
  Result: LOSS (-$0.35)
  
Trade 2: Stake $0.35 on UNDER 3
  Result: LOSS (-$0.35)
  
Trade 3: Stake $0.35 × 1.48 = $0.52 on UNDER 3
  Result: LOSS (-$0.52)
  
Trade 4: Stake $0.52 × 1.48 = $0.77 on UNDER 3
  Result: WIN (+$1.54)
  
✅ Total: -$0.35 - $0.35 - $0.52 + $1.54 = +$0.32 profit
↻ Reset to signal detection
```

---

## FILE REFERENCE

### Core Files
- **src/bot.js** - Main bot logic (DO NOT MODIFY)
- **src/strategy.js** - Trading strategy (DO NOT MODIFY)
- **src/websocket.js** - Connection manager (DO NOT MODIFY)
- **src/config.js** - Configuration loader (DO NOT MODIFY)

### Setup Files
- **src/oauth-setup.js** - OAuth2 URL generator
- **src/exchange-token.js** - Token exchange utility
- **src/get-account.js** - Account fetcher
- **src/refresh-token.js** - Token refresh

### Monitoring Files
- **scripts/health-check.js** - Verify setup
- **scripts/performance-report.js** - View metrics
- **logs/** - All output logs

### Configuration
- **.env** - Your credentials (KEEP PRIVATE!)
- **.env.example** - Template
- **package.json** - Dependencies

---

## SECURITY BEST PRACTICES

⚠️ **IMPORTANT:**

1. **Never commit .env to Git**
   - Already in .gitignore
   - Always use .env.example as template

2. **Keep tokens secure**
   - Don't share ACCESS_TOKEN
   - Don't post in forums/issues
   - Treat like password

3. **Use demo mode first**
   - Set TRADING_MODE=demo
   - Test strategy thoroughly
   - Only switch to real after confirmed success

4. **Monitor regularly**
   - Check logs daily
   - Review performance metrics
   - Stop bot if something seems wrong

5. **Set loss limits**
   - LOSS_THRESHOLD=$3000 is kill switch
   - Bot automatically stops if exceeded
   - Never remove this safeguard

---

## NEXT STEPS

1. ✅ Complete Part 1-5 above
2. ✅ Verify bot is running: `npm start`
3. ✅ Monitor logs: `tail -f logs/info-*.log`
4. ✅ Check performance: `node scripts/performance-report.js`
5. ✅ Once confident, switch to real: `TRADING_MODE=real` in .env

---

## SUPPORT

- **Deriv API Docs**: https://api.deriv.com/docs
- **Bot Issues**: Check logs in `logs/` directory
- **GitHub Issues**: Open an issue in repository
- **Deriv Support**: https://www.deriv.com/contact

---

## LICENSE

MIT License - Feel free to modify and use

---

**Ready? Start here:**
```bash
npm install
node src/oauth-setup.js
```
