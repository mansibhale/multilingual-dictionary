const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

// Create a path that works no matter where you run the script
const csvFilePath = path.join(__dirname, '../public/sample.csv');
const dbFilePath = path.join(__dirname, '../dictionary.db');

// Log paths to confirm
console.log('CSV path:', csvFilePath);
console.log('DB path:', dbFilePath);

const db = new sqlite3.Database(dbFilePath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS dictionary (
    English TEXT,
    Hindi TEXT,
    Marathi TEXT,
    Sanskrit TEXT
  )`);

  const stmt = db.prepare("INSERT INTO dictionary (English, Hindi, Marathi, Sanskrit) VALUES (?, ?, ?, ?)");

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      stmt.run(row.English, row.Hindi, row.Marathi, row.Sanskrit);
    })
    .on('end', () => {
      stmt.finalize();
      console.log('✅ CSV data successfully imported into SQLite!');
      db.close();
    })
    .on('error', (err) => {
      console.error('❌ Error reading CSV:', err.message);
    });
});
