import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logPath = path.join(__dirname, '../server.log');

console.log('Attempting to write to:', logPath);
try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] Scratch test\n`);
    console.log('Write successful');
} catch (e) {
    console.error('Write failed:', e);
}
