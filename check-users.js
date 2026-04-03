const Database = require('better-sqlite3');
const db = new Database('./server/database.sqlite');
const users = db.prepare('SELECT id, name, email, role FROM users').all();
console.log(JSON.stringify(users, null, 2));
