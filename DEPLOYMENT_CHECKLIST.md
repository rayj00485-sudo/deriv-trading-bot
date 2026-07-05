# Bot Deployment Checklist

## Pre-Launch Verification

### ✅ OAuth2 Setup
- [ ] Created Deriv application at https://app.deriv.com/account/applications
- [ ] Saved CLIENT_ID from application
- [ ] Saved APP_ID from application
- [ ] Set redirect URL to `http://localhost:3000/callback`
- [ ] Generated and saved code verifier from `node src/oauth-setup.js`
- [ ] Completed authorization flow in browser
- [ ] Exchanged code for access token
- [ ] Tested token with `node src/get-account.js`

### ✅ Environment Configuration
- [ ] Created `.env` file (copied from `.env.example`)
- [ ] Filled DERIV_CLIENT_ID
- [ ] Filled DERIV_APP_ID
- [ ] Filled DERIV_REDIRECT_URI
- [ ] Filled ACCESS_TOKEN
- [ ] Filled ACCOUNT_ID
- [ ] Set TRADING_MODE=demo (for testing)
- [ ] Verified all environment variables with `node scripts/health-check.js`

### ✅ Dependencies & Installation
- [ ] Node.js v18+ installed: `node -v`
- [ ] npm 8+ installed: `npm -v`
- [ ] Ran `npm install`
- [ ] All dependencies installed successfully
- [ ] No install errors in terminal

### ✅ Bot Configuration
- [ ] INITIAL_STAKE set to 0.35
- [ ] MARTINGALE_MULTIPLIER set to 1.48
- [ ] MAX_MARTINGALE_STEPS set to 12
- [ ] ASSET set to 1HZ100V
- [ ] PROFIT_THRESHOLD set to 100
- [ ] LOSS_THRESHOLD set to 3000 (safety limit)

### ✅ Health & Connectivity
- [ ] Health check passed: `node scripts/health-check.js`
- [ ] WebSocket OTP obtained successfully
- [ ] Account balance retrieved
- [ ] No error messages in health check

### ✅ Logs Setup
- [ ] `logs/` directory created automatically on first run
- [ ] Write permissions verified
- [ ] Log files can be created in `logs/` directory

### ✅ Test Run
- [ ] Started bot once with `npm start`
- [ ] Bot connected to Deriv successfully
- [ ] Received account balance
- [ ] Subscribed to ticks
- [ ] No critical errors in logs
- [ ] Bot properly shut down with Ctrl+C

### ✅ Security
- [ ] `.env` file is in `.gitignore` (checked)
- [ ] Never committed `.env` to Git
- [ ] ACCESS_TOKEN not shared anywhere
- [ ] ACCOUNT_ID kept private
- [ ] Client credentials only on local machine

### ✅ Monitoring Setup
- [ ] Installed PM2 for persistence (optional): `npm i -g pm2`
- [ ] Created monitoring script (optional)
- [ ] Set up performance tracking
- [ ] Know how to view logs: `tail -f logs/info-*.log`
- [ ] Know how to check performance: `node scripts/performance-report.js`

### ✅ Risk Management
- [ ] Loss threshold is set ($3000)
- [ ] Understood kill-switch behavior
- [ ] Have backup plan if bot needs to stop
- [ ] Reviewed maximum stake calculations
- [ ] Comfortable with initial 0.35 USD stake

### ✅ Strategy Understanding
- [ ] Understand 15-digit signal detection
- [ ] Understand UNDER 3 / OVER 6 signals
- [ ] Understand martingale progression (steps 1-12)
- [ ] Understand reset conditions (win or 12 losses)
- [ ] Reviewed example trade sequence in COMPLETE_SETUP.md

---

## Launch Decision Matrix

### SAFE TO LAUNCH (All ✅ above + DEMO mode)
```
✅ All checks passed
✅ TRADING_MODE=demo in .env
✅ Health check passed
✅ Test run successful
✅ Ready to monitor
→ PROCEED TO LAUNCH
```

### NOT READY TO LAUNCH (Any ❌ above)
```
❌ Any failed check
❌ Health check failed
❌ Configuration errors
❌ Bot won't connect
→ FIX ISSUES BEFORE LAUNCH
```

### READY FOR REAL MONEY (After successful DEMO trading)
```
✅ Demo trading for 1+ week
✅ Consistent profitability
✅ No major errors
✅ Comfortable with strategy
✅ Ready to risk real money
→ Change TRADING_MODE=real
→ Use real account
→ Start with small account
```

---

## Launch Commands

### Development/Demo Launch
```bash
npm install
node scripts/health-check.js
npm start
```

### Monitor Bot
```bash
# Terminal 1 - Running bot
npm start

# Terminal 2 - View logs
tail -f logs/info-$(date +%Y-%m-%d).log

# Terminal 3 - Performance metrics
watch -n 5 'node scripts/performance-report.js'
```

### Stop Bot Safely
```bash
Ctrl+C  # Graceful shutdown
```

---

## Post-Launch Monitoring

### Daily Routine
- [ ] Check bot is running: `ps aux | grep node`
- [ ] View today's logs: `cat logs/info-$(date +%Y-%m-%d).log`
- [ ] Check performance: `node scripts/performance-report.js`
- [ ] Verify account balance hasn't hit loss threshold
- [ ] No error logs: `cat logs/error-$(date +%Y-%m-%d).log`

### Weekly Review
- [ ] Win rate analysis from performance report
- [ ] Total profit/loss summary
- [ ] Compare actual vs expected returns
- [ ] Check for any patterns in losses
- [ ] Verify loss threshold wasn't approached

### Emergency Stop Conditions
```
STOP BOT IF:
❌ Loss threshold hit ($3000)
❌ Unexpected errors in logs
❌ WebSocket keeps disconnecting
❌ Account balance drops rapidly
❌ Bot not trading for 1+ hour (signal detection issue)
❌ Any security concern
```

---

## Troubleshooting Quick Reference

| Issue | Cause | Solution |
|-------|-------|----------|
| "Missing environment variables" | .env incomplete | Fill all fields, run health check |
| "Authorization failed" | Token expired | Run `node src/oauth-setup.js` again |
| "WebSocket connection failed" | Invalid credentials | Verify ACCOUNT_ID and ACCESS_TOKEN |
| "No ticks received" | Market closed or symbol unavailable | Check market hours, try different asset |
| "Stuck in signal detection" | Pattern not found | Normal - just waiting for pattern |
| "Bot crashes repeatedly" | Configuration error | Check logs, run health check |
| "Can't connect to Deriv" | Network issue | Check internet, check Deriv status |

---

## Version Information

```
Node.js:     18+
npm:         8+
ws:          8.14.2+
node-fetch:  3.3.2+
dotenv:      16.3.1+
```

---

## Backup Plan

If bot fails:

1. **Immediate**: Stop bot (`Ctrl+C`)
2. **Check Logs**: `cat logs/error-$(date +%Y-%m-%d).log`
3. **Health Check**: `node scripts/health-check.js`
4. **Restart**: `npm start`
5. **If Still Failing**: 
   - Check internet connection
   - Verify .env variables
   - Refresh tokens
   - Restart computer if needed

---

✅ **When all items are checked, you are ready to launch!**
