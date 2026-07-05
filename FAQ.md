# Trading Bot FAQ

## General Questions

### Q: Is this bot legal?
**A:** Yes, automated trading bots are legal. However:
- Some brokers may restrict bot usage - check Deriv's terms
- Always use demo accounts for testing
- Deriv allows algorithmic trading within their API limits
- Consult legal advice if in regulated jurisdictions

### Q: How much money should I start with?
**A:** 
- Initial stake: $0.35 per contract
- 12 steps with 1.48x multiplier = up to ~$12.50 max stake
- Recommended account balance: $3000-5000 minimum
- Loss threshold is set to $3000 as safety limit

### Q: Can I modify the strategy?
**A:** Yes! Edit `src/strategy.js` to change:
- Signal detection logic (15-digit pattern)
- Martingale progression
- Stake calculations
- Reset conditions

### Q: What if the bot crashes?
**A:** 
- Check logs: `cat logs/error-*.log`
- Run health check: `node scripts/health-check.js`
- Restart: `npm start`
- Auto-reconnection with backoff built-in

### Q: Can I run multiple bots?
**A:** 
- Each bot needs separate .env file
- Create: `.env.bot1`, `.env.bot2`
- Modify config.js to read different .env
- Risk: Account limits, API rate limits

---

## Technical Questions

### Q: What if my token expires?
**A:** 
```bash
node src/oauth-setup.js
node src/exchange-token.js <CODE> <VERIFIER>
# Update .env with new token
```

### Q: How do I know if the bot is working?
**A:**
```bash
# Check logs
tail -f logs/info-$(date +%Y-%m-%d).log

# Check performance
node scripts/performance-report.js

# Check status
node scripts/health-check.js
```

### Q: What's the API rate limit?
**A:** Deriv allows:
- 100 requests per second
- 100 subscriptions per connection
- Bot respects these limits automatically

### Q: Can I use real money immediately?
**A:** 
- Test with TRADING_MODE=demo first
- Run for at least 1 week
- Verify profitability and stability
- Only then switch to TRADING_MODE=real

### Q: What symbols can I trade?
**A:**
Available in API_REFERENCE.js:
- 1HZ100V (Volatility 100) - Recommended
- 1HZ200V, 1HZ500V, 1HZ1000V (Other volatility)
- CRASH500, BOOM500, etc.

Check regional availability on Deriv.

---

## Strategy Questions

### Q: What does the 15-digit signal mean?
**A:**
- Bot monitors last 15 consecutive ticks
- If ALL 15 > 3: Buy UNDER 3 contract
- If ALL 15 < 6: Buy OVER 6 contract
- Otherwise: Keep waiting

Example:
```
Ticks: [5, 7, 4, 8, 6, 9, 7, 5, 4, 8, 7, 9, 6, 5, 4]
        ^ (all > 3) ✓ SIGNAL DETECTED
```

### Q: How does the martingale work?
**A:**
```
Step 1: Stake $0.35
Step 2: Stake $0.35 (same)
Step 3: Stake $0.35 × 1.48 = $0.52
Step 4: Stake $0.52 × 1.48 = $0.77
...
Step 12: Stake calculated

If Step 12 loses:
  Reset to Step 1, keep trading
  
If any step wins:
  Reset to signal detection
```

### Q: What's the maximum stake?
**A:**
With $0.35 initial and 1.48x multiplier:
- Step 10 ≈ $8.50
- Step 11 ≈ $12.60
- Step 12 ≈ $18.65

Total max loss (all 12 steps lose): ~$47

### Q: What's the profit expectation?
**A:**
- Highly variable
- Depends on win rate and market volatility
- Demo testing for 1+ week recommended
- Keep loss threshold in mind ($3000)

---

## Troubleshooting

### Q: "Bot stuck in signal detection"
**A:** Normal! Waiting for specific 15-digit pattern. Monitor ticks:
```bash
tail -f logs/info-*.log
```

### Q: "No ticks received"
**A:** Check:
1. Market hours (24/5 for volatility indices)
2. Symbol availability in your region
3. Account has trading enabled

### Q: "Contract won't settle"
**A:** 
- 1-tick contracts settle immediately
- Check Deriv API status
- Restart bot if needed

### Q: "Balance not updating"
**A:**
```bash
node scripts/health-check.js
# Verify connection
npm start
# Restart bot
```

### Q: "Losing consistently"
**A:**
- Strategy variance is normal
- Test more cycles
- Check logs for patterns
- Win rate should stabilize over time
- Consider loss threshold hit

---

## Security

### Q: Is my access token safe?
**A:** 
- Only stored locally in .env (git ignored)
- Never transmitted to third parties
- Keep .env file private
- Consider token as sensitive as password

### Q: Can the bot steal my money?
**A:**
- Loss threshold prevents excessive losses ($3000)
- Code is open source - you can review
- Bot can't withdraw funds
- Bot only places trades within parameters

### Q: What if GitHub is compromised?
**A:**
- Download code to local machine
- Run bot locally only
- Code is open source - review before running
- Store credentials only locally

---

## Performance

### Q: How fast does the bot trade?
**A:**
- Submits trade on every tick
- Tick frequency: Multiple per second
- Network latency: <100ms typical
- Settlement: 1 tick = instant

### Q: Will the bot drain my account?
**A:**
- Loss threshold = $3000 (kills bot)
- Initial stake = $0.35 (conservative)
- Max single loss: ~$18 (step 12)
- Risk management built-in

### Q: Can I pause the bot?
**A:**
```bash
Ctrl+C  # Graceful shutdown
```
Bot saves all state, can resume later.

---

## Advanced

### Q: Can I customize the strategy?
**A:** Yes! Modify these files:
- `src/strategy.js` - Signal/martingale logic
- `src/config.js` - Parameters
- `src/bot.js` - Main flow

### Q: How do I backtest?
**A:**
```bash
node src/backtest.js --run
```
Review results and modify as needed.

### Q: Can I add external data?
**A:** Yes! Modify strategy.js to accept:
- Market technical indicators
- Sentiment data
- Other signals

### Q: How do I optimize performance?
**A:**
- Use Node.js 18+ for speed
- Monitor memory usage
- Check WebSocket latency
- Review trade frequency

---

## Getting Help

- **Bot Issues**: Check `logs/error-*.log`
- **API Issues**: https://api.deriv.com/docs
- **Deriv Support**: https://www.deriv.com/contact
- **GitHub Issues**: Open issue in repository

---

**Last Updated**: 2026-07-05
