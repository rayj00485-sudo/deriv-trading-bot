/**
 * Setup Guide for Deriv Trading Bot
 * 
 * This document covers the complete setup process for connecting the bot to Deriv's new API.
 */

// ============================================================================
// STEP 1: REGISTER YOUR APPLICATION WITH DERIV
// ============================================================================

/*
1. Go to: https://app.deriv.com/account/applications
2. Click "Create a new app"
3. Fill in the details:
   - App Name: "Deriv Trading Bot"
   - Redirect URL: http://localhost:3000/callback (for local testing)
                   For production: https://yourdomain.com/callback
   - Allowed scopes: "trade"
4. After creation, you'll get:
   - CLIENT_ID (store this)
   - APP_ID (store this)
*/

// ============================================================================
// STEP 2: OBTAIN OAUTH2 ACCESS TOKEN
// ============================================================================

/*
There are two ways to get an access token:

OPTION A: Manual Browser Flow (First Time)
- Run the auth script below to get OAuth URL
- Paste it in your browser
- User logs in with Deriv credentials
- Deriv redirects to your redirect_uri with ?code=XXX
- Exchange code for token (handled by script)
- Save the token to .env

OPTION B: API Request (if you have a code)
- POST https://auth.deriv.com/oauth2/token
- Body:
  {
    grant_type: 'authorization_code',
    client_id: YOUR_CLIENT_ID,
    code: AUTH_CODE_FROM_REDIRECT,
    code_verifier: PKCE_CODE_VERIFIER,
    redirect_uri: YOUR_REDIRECT_URI
  }
*/

// ============================================================================
// STEP 3: GET ACCOUNT ID
// ============================================================================

/*
Once you have an access token:

1. Make a GET request to:
   GET https://api.derivws.com/trading/v1/options/accounts
   Headers: Authorization: Bearer YOUR_ACCESS_TOKEN

2. Response example:
   {
     data: [
       {
         account_id: "abc123",
         account_type: "demo",
         is_virtual: true,
         currency: "USD"
       }
     ]
   }

3. Copy the account_id value
*/

// ============================================================================
// STEP 4: ENVIRONMENT CONFIGURATION
// ============================================================================

/*
1. Copy .env.example to .env:
   cp .env.example .env

2. Edit .env and fill in:
   DERIV_CLIENT_ID=your_client_id_from_step_1
   DERIV_APP_ID=your_app_id_from_step_1
   ACCESS_TOKEN=your_token_from_step_2
   ACCOUNT_ID=your_account_id_from_step_3
   DERIV_REDIRECT_URI=http://localhost:3000/callback
   TRADING_MODE=demo (use 'demo' or 'real')

3. Save the file
*/

// ============================================================================
// STEP 5: INSTALL DEPENDENCIES
// ============================================================================

/*
1. Install Node.js 18+ from: https://nodejs.org/

2. In your bot directory, run:
   npm install

This installs:
- ws: WebSocket client
- node-fetch: HTTP requests
- dotenv: Environment variable management
*/

// ============================================================================
// STEP 6: UNDERSTAND WEBSOCKET CONNECTION FLOW
// ============================================================================

/*
The bot connects via WebSocket with OAuth2 + OTP authentication:

1. Your app has an access token (from OAuth2)
2. When bot starts, it requests a WebSocket OTP URL:
   POST https://api.derivws.com/trading/v1/options/accounts/{ACCOUNT_ID}/otp
   Headers: 
     - Deriv-App-ID: YOUR_APP_ID
     - Authorization: Bearer YOUR_ACCESS_TOKEN

3. Response includes a WebSocket URL with embedded OTP:
   wss://api.derivws.com/trading/v1/options/ws/demo?otp=XXXXXXXX

4. Bot connects to this WebSocket URL
5. OTP automatically authenticates your connection
6. You can now:
   - Subscribe to live ticks
   - Get account balance
   - Request contract proposals
   - Buy contracts
   - Monitor open contracts
*/

// ============================================================================
// STEP 7: API ENDPOINTS & MESSAGE TYPES
// ============================================================================

/*
ONCE CONNECTED, YOU CAN USE:

1. TICKS (Live Price Updates)
   Send:
   { ticks: "1HZ100V", subscribe: 1 }
   
   Receive:
   { msg_type: "tick", tick: { quote: 8.75, bid: 8.73, ask: 8.77 } }

2. BALANCE
   Send:
   { balance: 1, subscribe: 1 }
   
   Receive:
   { msg_type: "balance", balance: { balance: 1000.50, currency: "USD" } }

3. PROPOSAL (Get Quote)
   Send:
   {
     proposal: 1,
     contract_type: "CALL",
     currency: "USD",
     duration: 1,
     duration_unit: "t",
     amount: 10,
     basis: "stake",
     symbol: "1HZ100V"
   }
   
   Receive:
   { msg_type: "proposal", proposal: { id: "xyz", ask_price: 8.50, ... } }

4. BUY (Purchase Contract)
   Send:
   { buy: "proposal_id", price: 8.50 }
   
   Receive:
   { msg_type: "buy", buy: { contract_id: "123", stake: 10, ... } }

5. PROPOSAL_OPEN_CONTRACT (Monitor Contract)
   Send:
   { proposal_open_contract: 1, contract_id: "123", subscribe: 1 }
   
   Receive:
   { msg_type: "proposal_open_contract", proposal_open_contract: { profit: 5.50, is_sold: true, ... } }

6. SELL (Close Contract Early)
   Send:
   { sell: "contract_id", price: 8.30 }
   
   Receive:
   { msg_type: "sell", sell: { sold_for: 8.30 } }
*/

// ============================================================================
// STEP 8: SYMBOL REFERENCE
// ============================================================================

/*
Common Deriv Symbols:
- Volatility 100 Index: 1HZ100V
- Crash 500 Index: 1HZ500V
- Step Index: 1HZ10V
- Boom/Crash Pairs: BOOM500, CRASH500, BOOM1000, CRASH1000

For your bot, we're using: 1HZ100V (Volatility 100)
*/

// ============================================================================
// STEP 9: BOT STARTUP
// ============================================================================

/*
1. Make sure .env is configured
2. Run:
   npm start

3. Expected output:
   ✅ Configuration validated
   🤖 Starting Deriv Trading Bot...
   ⚙️  Configuration loaded
   🔐 Obtaining WebSocket authentication...
   ✅ WebSocket connected to Deriv
   💰 Balance: 1000.00 USD
   📊 Subscribing to ticks...

4. Bot now waits for signal detection
5. Logs are saved to logs/ directory
*/

// ============================================================================
// STEP 10: TROUBLESHOOTING
// ============================================================================

/*
ERROR: "Missing environment variables"
→ Check that .env exists and all required fields are filled

ERROR: "Failed to get OTP"
→ Verify ACCESS_TOKEN is valid (may have expired)
→ Generate a new token

ERROR: "WebSocket connection failed"
→ Check that your APP_ID and ACCOUNT_ID are correct
→ Ensure internet connection is stable
→ Check Deriv API status: https://status.deriv.com

ERROR: "Authorization failed"
→ Token may have expired, request a new one
→ Verify token scope includes 'trade'

NO TICKS RECEIVED:
→ Confirm symbol "1HZ100V" is available in your region
→ Check that account has trading enabled
*/

// ============================================================================
// STEP 11: STRATEGY EXPLANATION
// ============================================================================

/*
Your bot implements this trading strategy:

1. SIGNAL DETECTION
   - Monitors 15 consecutive ticks
   - If ALL > 3: Signal = UNDER 3
   - If ALL < 6: Signal = OVER 6

2. MARTINGALE EXECUTION
   - Step 1-2: Stake = $0.35 (no multiplier)
   - Step 3-12: Stake *= 1.48 (each step)
   - On loss: Go to next step
   - On win: Reset to signal detection
   - After 12 losses: Reset to $0.35, keep trading

3. RISK LIMITS
   - Loss Threshold: $3000 (bot stops if exceeded)
   - Profit Threshold: $100 (trigger for reset)

4. TRADING TIMING
   - Trades on EVERY tick after signal
   - Immediate execution
   - No delays or conditions
*/

export const setupGuide = {};
