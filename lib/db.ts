import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.FACTURIA_DATA_DIR || path.join(process.cwd(), "data");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, "facturia.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      business_name TEXT,
      business_nif TEXT,
      business_address TEXT,
      business_email TEXT,
      business_phone TEXT,
      invoice_prefix TEXT NOT NULL DEFAULT 'F',
      default_iva REAL NOT NULL DEFAULT 21,
      default_irpf REAL NOT NULL DEFAULT 15,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      nif TEXT,
      email TEXT,
      address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'borrador', -- borrador | enviada | pagada | vencida
      issue_date TEXT NOT NULL,
      due_date TEXT,
      iva_pct REAL NOT NULL DEFAULT 21,
      irpf_pct REAL NOT NULL DEFAULT 0,
      notes TEXT,
      share_token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_items_invoice ON invoice_items(invoice_id);
  `);
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  plan: "free" | "pro" | "negocio";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  business_name: string | null;
  business_nif: string | null;
  business_address: string | null;
  business_email: string | null;
  business_phone: string | null;
  invoice_prefix: string;
  default_iva: number;
  default_irpf: number;
  created_at: string;
}

export interface Client {
  id: number;
  user_id: number;
  name: string;
  nif: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Invoice {
  id: number;
  user_id: number;
  client_id: number;
  number: string;
  status: "borrador" | "enviada" | "pagada" | "vencida";
  issue_date: string;
  due_date: string | null;
  iva_pct: number;
  irpf_pct: number;
  notes: string | null;
  share_token: string;
  created_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  position: number;
}
