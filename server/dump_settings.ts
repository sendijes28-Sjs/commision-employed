import db from './db.js';

const allSettings = db.prepare('SELECT * FROM settings').all();
console.log(JSON.stringify(allSettings, null, 2));
process.exit(0);
