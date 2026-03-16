import db from './db.js';

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables);

const settings = db.prepare("SELECT * FROM settings").all();
console.log("Settings:", settings);
process.exit(0);
