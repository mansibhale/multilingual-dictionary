const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');

const isDev = process.env.ELECTRON_START_URL !== undefined || process.env.NODE_ENV === 'development';

const dbPath = isDev
  ? path.join(__dirname, 'dictionary.db')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'build', 'dictionary.db');

console.log('📂 DB Path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Database connection error:', err.message);
  else console.log('✅ Connected to SQLite database.');
});

function getWords(callback) {
  db.all('SELECT * FROM dictionary', [], (err, rows) => {
    if (err) callback(err);
    else callback(null, rows);
  });
}

module.exports = { db, getWords };