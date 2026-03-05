import Database from 'better-sqlite3';
import path from 'path';

// Create or connect to the database file
const db = new Database(path.join(process.cwd(), 'sqlite.db'));
db.pragma('journal_mode = WAL');

// Initialize schema for Member Management
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    date_of_birth TEXT,
    gender TEXT,
    status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    plan TEXT DEFAULT 'Basic',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS membership_history (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    plan_id TEXT,
    start_date TEXT,
    end_date TEXT,
    price_paid REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    duration_type TEXT DEFAULT 'Monthly',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
