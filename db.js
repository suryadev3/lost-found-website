const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "lostfound.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',       -- 'student' or 'admin'
    verified INTEGER NOT NULL DEFAULT 0,
    verify_token TEXT,
    verify_token_expires TEXT,
    reset_token TEXT,
    reset_token_expires TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,               -- 'lost' or 'found'
    category TEXT NOT NULL,           -- e.g. 'Electronics', 'ID Card', 'Bag', 'Bottle', 'Other'
    title TEXT NOT NULL,              -- short item name, e.g. "Black Wildcraft Backpack"
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    photo_path TEXT,
    status TEXT NOT NULL DEFAULT 'Open',   -- 'Open', 'Matched', 'Returned'
    created_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed one ready-to-use admin account (pre-verified) on first run only
const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (userCount === 0) {
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (name, email, password, role, verified) VALUES (?, ?, ?, 'admin', 1)"
  ).run("Admin", "admin@college.edu", hash);
  console.log("Seeded default admin -> email: admin@college.edu | password: admin123");
}

module.exports = db;
