import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname, '../../server.log');

/**
 * Centralized file logger — replaces all duplicated logToFile() calls.
 */
export const logger = {
  info: (msg: string) => {
    const logMsg = `[${new Date().toISOString()}] [INFO] ${msg}\n`;
    fs.appendFileSync(LOG_PATH, logMsg);
  },

  warn: (msg: string) => {
    const logMsg = `[${new Date().toISOString()}] [WARN] ${msg}\n`;
    fs.appendFileSync(LOG_PATH, logMsg);
  },

  error: (msg: string) => {
    const logMsg = `[${new Date().toISOString()}] [ERROR] ${msg}\n`;
    console.error(logMsg.trim());
    fs.appendFileSync(LOG_PATH, logMsg);
  },
};
