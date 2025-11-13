const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Load the database file (adjust path if needed)
const dbPath = path.join(__dirname, 'dictionary.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Database connection error:', err.message);
  else console.log('✅ Connected to SQLite database.');
});

// Example function: get all rows
function getWords(callback) {
  db.all('SELECT * FROM dictionary', [], (err, rows) => {
    if (err) callback(err);
    else callback(null, rows);
  });
}

module.exports = { getWords };
