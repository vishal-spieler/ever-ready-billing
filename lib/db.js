import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let dbInstance = null;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // Database stored in root of the project
  const dbPath = path.resolve(process.cwd(), 'ever_ready.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON');

  // Initialize Schema
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      gstin TEXT,
      pan TEXT,
      bank_name TEXT,
      bank_branch TEXT,
      account_name TEXT,
      account_no TEXT,
      ifsc_code TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      mobile TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      pin TEXT NOT NULL,
      gstin TEXT,
      pan TEXT
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      client_id INTEGER NOT NULL,
      po_no TEXT,
      po_date TEXT,
      tax_type TEXT NOT NULL, -- 'CGST_SGST', 'IGST', 'NONE'
      cgst_rate REAL DEFAULT 9,
      sgst_rate REAL DEFAULT 9,
      igst_rate REAL DEFAULT 18,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      transport_charges REAL DEFAULT 0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      igst_amount REAL DEFAULT 0,
      gross_total REAL NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      sr INTEGER NOT NULL,
      desc TEXT NOT NULL,
      hsn TEXT,
      qty REAL NOT NULL,
      rate REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_no TEXT UNIQUE NOT NULL,
      quotation_date TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      client_id INTEGER NOT NULL,
      tax_type TEXT NOT NULL, -- 'CGST_SGST', 'IGST', 'NONE'
      cgst_rate REAL DEFAULT 9,
      sgst_rate REAL DEFAULT 9,
      igst_rate REAL DEFAULT 18,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      transport_charges REAL DEFAULT 0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      igst_amount REAL DEFAULT 0,
      gross_total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'DECLINED'
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS quotation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id INTEGER NOT NULL,
      sr INTEGER NOT NULL,
      desc TEXT NOT NULL,
      hsn TEXT,
      qty REAL NOT NULL,
      rate REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      date TEXT NOT NULL,
      read INTEGER DEFAULT 0 -- 0 = false, 1 = true
    );

    CREATE TABLE IF NOT EXISTS invoice_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      payment_date TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      payment_mode TEXT NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER')),
      reference_number TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoice_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      comment_type TEXT NOT NULL CHECK (comment_type IN ('NOTE', 'PAYMENT', 'SYSTEM')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_comments_invoice_id ON invoice_comments(invoice_id);
  `);

  // Seed default settings if empty
  const settingsCount = await dbInstance.get('SELECT COUNT(*) as count FROM company_settings');
  if (settingsCount.count === 0) {
    await dbInstance.run(`
      INSERT INTO company_settings (id, name, address, phone, email, gstin, pan, bank_name, bank_branch, account_name, account_no, ifsc_code)
      VALUES (
        1,
        'EVER READY ENGINEERS',
        'Plate no 192/1, sr.no 1 Nilai nivas Nagarsolapur road, Mirajaon, Ahilyanagar -414402',
        '8888162227',
        'erengieners01@gmail.com',
        '27FBFD9897L1Z5',
        'FBFD9897L',
        'Ahilyanagar co-operative bank',
        'Chincholi Kaldat',
        'Ever Ready Engineers',
        '02161102100018',
        'AHDC0000216'
      )
    `);
  }

  // Seed default notifications if empty
  const notificationsCount = await dbInstance.get('SELECT COUNT(*) as count FROM notifications');
  if (notificationsCount.count === 0) {
    await dbInstance.run(`
      INSERT INTO notifications (type, title, message, date, read)
      VALUES 
      ('payment_due', 'Payment Due', 'INV-001 is due on 04-07-2026', '2 hours ago', 0),
      ('quote_expiring', 'Quote Expiring', 'QUO-001 expires in 5 days', '5 hours ago', 0)
    `);
  }

  // Seed default clients, invoices, and quotations if empty
  const clientsCount = await dbInstance.get('SELECT COUNT(*) as count FROM clients');
  if (clientsCount.count === 0) {
    await dbInstance.run(`
      INSERT INTO clients (id, name, contact_person, mobile, email, address, city, state, pin, gstin, pan)
      VALUES 
      (1, 'TATA MOTORS LTD', 'R. K. Sharma', '9822012345', 'tata.motors@tata.com', 'Pimpri Industrial Area Sector A', 'Pune', 'Maharashtra', '411018', '27AAAAT1234A1Z1', 'AAAT1234A'),
      (2, 'RELIANCE INDUSTRIES', 'A. K. Ambani', '8888888888', 'info@ril.com', 'Ghansoli', 'Navi Mumbai', 'Maharashtra', '400701', '27AAACR4321B1Z2', 'AAACR4321B')
    `);
    
    await dbInstance.run(`
      INSERT INTO invoices (id, invoice_no, invoice_date, client_id, po_no, po_date, tax_type, cgst_rate, sgst_rate, igst_rate, subtotal, cgst_amount, sgst_amount, igst_amount, gross_total)
      VALUES (1, 'INV-101', '2026-06-01', 1, 'PO-TATAMOTORS-99', '2026-05-28', 'CGST_SGST', 9, 9, 18, 1200000, 108000, 108000, 0, 1416000)
    `);
    
    await dbInstance.run(`
      INSERT INTO invoice_items (invoice_id, sr, desc, hsn, qty, rate, total)
      VALUES (1, 1, 'Precision Lathe Machining Work', '8466', 2, 600000, 1200000)
    `);

    await dbInstance.run(`
      INSERT INTO quotations (id, quotation_no, quotation_date, valid_until, client_id, tax_type, cgst_rate, sgst_rate, igst_rate, subtotal, cgst_amount, sgst_amount, igst_amount, gross_total, status)
      VALUES (1, 'QUO-101', '2026-06-03', '2026-07-03', 2, 'IGST', 9, 9, 18, 360000, 0, 0, 64800, 424800, 'PENDING')
    `);
    
    await dbInstance.run(`
      INSERT INTO quotation_items (quotation_id, sr, desc, hsn, qty, rate, total)
      VALUES (1, 1, 'Industrial Laser Cutting & Welding Services', '8456', 3, 120000, 360000)
    `);
  }

  return dbInstance;
}
