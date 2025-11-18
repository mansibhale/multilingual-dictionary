const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const db = new sqlite3.Database('./dictionary.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS dictionary (
    English TEXT,
    Hindi TEXT,
    Marathi TEXT,
    Sanskrit TEXT
  )`);

  const stmt = db.prepare("INSERT INTO dictionary (English, Hindi, Marathi, Sanskrit) VALUES (?, ?, ?, ?)");

fs.createReadStream('../public/sample.csv')
    .pipe(csv())
    .on('data', (row) => {
      stmt.run(row.English, row.Hindi, row.Marathi, row.Sanskrit);
    })
    .on('end', () => {
      stmt.finalize();
      console.log('✅ CSV data successfully imported into SQLite!');
      db.close();
    });
});
