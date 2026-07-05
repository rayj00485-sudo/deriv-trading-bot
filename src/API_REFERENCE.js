/**
 * API Reference for Deriv WebSocket
 * 
 * This file documents all WebSocket message types and payloads
 */

export const API_REFERENCE = {
  // ============================================
  // TICKS - Live Price Stream
  // ============================================
  TICKS: {
    description: 'Subscribe to live tick updates for a symbol',
    request: {
      ticks: 'SYMBOL_ID',  // e.g., "1HZ100V"
      subscribe: 1,
      req_id: 1  // Unique request ID
    },
    response: {
      msg_type: 'tick',
      tick: {
        bid: 8.73,           // Bid price
        ask: 8.77,           // Ask price
        quote: 8.75,         // Last trade price
        epoch: 1234567890,   // Unix timestamp
        id: 'tick_123'       // Tick ID
      }
    }
  },

  // ============================================
  // BALANCE - Account Balance
  // ============================================
  BALANCE: {
    description: 'Get current account balance',
    request: {
      balance: 1,
      subscribe: 1,
      req_id: 2
    },
    response: {
      msg_type: 'balance',
      balance: {
        balance: 1000.50,    // Balance amount
        currency: 'USD',     // Currency code
        loginid: 'abc123'    // Account ID
      }
    }
  },

  // ============================================
  // PROPOSAL - Get Contract Quote
  // ============================================
  PROPOSAL: {
    description: 'Request a contract proposal/quote',
    request: {
      proposal: 1,
      contract_type: 'CALL',  // or 'PUT'
      currency: 'USD',
      duration: 1,
      duration_unit: 't',     // 't' for ticks, 'm' for minutes, 'h' for hours, 'd' for days
      amount: 10,             // Stake amount
      basis: 'stake',         // Always 'stake' for our use case
      symbol: '1HZ100V',
      req_id: 3
    },
    response: {
      msg_type: 'proposal',
      proposal: {
        id: 'proposal_xyz',   // Proposal ID (use for BUY)
        contract_type: 'CALL',
        currency: 'USD',
        expiry_time: 1234567891,
        ask_price: 8.50,      // Cost of contract
        payout: 20.00,        // Payout if wins
        bid_price: 7.50       // Current bid price
      }
    }
  },

  // ============================================
  // BUY - Purchase Contract
  // ============================================
  BUY: {
    description: 'Buy a contract',
    request: {
      buy: 'proposal_id',     // From PROPOSAL response
      price: 8.50,            // Ask price to buy at
      req_id: 4
    },
    response: {
      msg_type: 'buy',
      buy: {
        contract_id: 'contract_123',
        stake: 10,            // Amount staked
        ask_price: 8.50,
        payout: 20.00,
        currency: 'USD',
        transaction_id: 12345
      }
    }
  },

  // ============================================
  // PROPOSAL_OPEN_CONTRACT - Monitor Contract
  // ============================================
  PROPOSAL_OPEN_CONTRACT: {
    description: 'Subscribe to live updates of an open contract',
    request: {
      proposal_open_contract: 1,
      contract_id: 'contract_123',  // From BUY response
      subscribe: 1,
      req_id: 5
    },
    response: {
      msg_type: 'proposal_open_contract',
      proposal_open_contract: {
        contract_id: 'contract_123',
        status: 'open',              // 'open' or 'closed'
        entry_tick: 8.74,
        entry_tick_time: 1234567890,
        current_spot: 8.76,
        current_spot_time: 1234567891,
        profit: 5.50,                // Current profit/loss
        bid_price: 8.30,             // Current sell price
        is_sold: false,              // True when contract settled/sold
        payout: 20.00,
        ask_price: 20.50
      }
    }
  },

  // ============================================
  // SELL - Close Contract Early
  // ============================================
  SELL: {
    description: 'Sell/close an open contract early',
    request: {
      sell: 'contract_id',    // Contract to close
      price: 8.30,            // Bid price to sell at
      req_id: 6
    },
    response: {
      msg_type: 'sell',
      sell: {
        contract_id: 'contract_123',
        transaction_id: 12346,
        sold_for: 8.30        // Amount received
      }
    }
  },

  // ============================================
  // FORGET - Unsubscribe
  // ============================================
  FORGET: {
    description: 'Unsubscribe from a stream',
    request: {
      forget: 'stream_id',    // Stream ID to stop listening
      req_id: 7
    },
    response: {
      msg_type: 'forget',
      forget: 'stream_id'
    }
  },

  // ============================================
  // PING - Keep Connection Alive
  // ============================================
  PING: {
    description: 'Send ping to keep connection alive',
    request: {
      ping: 1,
      req_id: 100
    },
    response: {
      msg_type: 'pong'
    }
  },

  // ============================================
  // ERROR - Error Response
  // ============================================
  ERROR: {
    description: 'Error response from API',
    response: {
      error: {
        code: 'InvalidSymbol',
        message: 'The symbol is invalid'
      },
      req_id: 1
    }
  }
};

// ============================================
// CONTRACT TYPES
// ============================================
export const CONTRACT_TYPES = {
  CALL: 'CALL',      // Price goes UP
  PUT: 'PUT',        // Price goes DOWN
  TOUCH: 'TOUCH',    // Price touches a level
  NOTOUCH: 'NOTOUCH',// Price doesn't touch a level
  RANGE: 'RANGE',    // Price stays in range
  EXPIRANGE: 'EXPIRANGE' // Price ends in range
};

// ============================================
// DURATION UNITS
// ============================================
export const DURATION_UNITS = {
  TICKS: 't',   // Ticks
  MINUTES: 'm', // Minutes
  HOURS: 'h',   // Hours
  DAYS: 'd'     // Days
};

// ============================================
// SYMBOLS
// ============================================
export const SYMBOLS = {
  VOLATILITY_100: '1HZ100V',
  VOLATILITY_200: '1HZ200V',
  VOLATILITY_500: '1HZ500V',
  VOLATILITY_1000: '1HZ1000V',
  STEP_INDEX: '1HZ10V',
  CRASH_500: 'CRASH500',
  CRASH_1000: 'CRASH1000',
  BOOM_500: 'BOOM500',
  BOOM_1000: 'BOOM1000'
};
