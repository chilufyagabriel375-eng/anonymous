const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.sqlite');
const firstRun = !fs.existsSync(DB_PATH);
const db = new Database(DB_PATH);

if (firstRun) {
  // simple schema
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room TEXT NOT NULL,
      sender_id INTEGER,
      sender_name TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE marketplace_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER,
      title TEXT,
      price INTEGER,
      photo TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER,
      filename TEXT,
      original_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // seed default room
  const insertRoom = db.prepare('INSERT INTO rooms (name) VALUES (?)');
  insertRoom.run('general');
}

module.exports = db;
