import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const logToFile = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logFile = path.join(logsDir, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);
  
  let logEntry = `[${timestamp}] ${level}: ${message}`;
  if (data) {
    logEntry += `\n${JSON.stringify(data, null, 2)}`;
  }
  logEntry += '\n';

  fs.appendFileSync(logFile, logEntry);
};

export const logger = {
  info: (message, data) => {
    console.log(`ℹ️  ${message}`, data || '');
    logToFile('INFO', message, data);
  },

  success: (message, data) => {
    console.log(`✅ ${message}`, data || '');
    logToFile('SUCCESS', message, data);
  },

  warn: (message, data) => {
    console.warn(`⚠️  ${message}`, data || '');
    logToFile('WARN', message, data);
  },

  error: (message, data) => {
    console.error(`❌ ${message}`, data || '');
    logToFile('ERROR', message, data);
  },

  trade: (tradeData) => {
    const tradeFile = path.join(logsDir, `trades-${new Date().toISOString().split('T')[0]}.log`);
    const entry = `[${getTimestamp()}] ${JSON.stringify(tradeData)}\n`;
    fs.appendFileSync(tradeFile, entry);
  },
};
