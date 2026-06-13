# Ever Ready Billing System

A modern engineering-oriented invoice, payment, and quotation tracking application built for **Ever Ready Engineers**.

## Stack
* **Framework**: Next.js App Router
* **Database**: Supabase PostgreSQL (Cloud) with a fully featured local **SQLite** database fallback.
* **Branding & PDF/Excel Exporter**: custom SVG headers, `exceljs` and `jspdf` / `jspdf-autotable`.

---

## Getting Started

### 1. Configure Dockets / Dbs
Create a `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (recommended for server-side queries)
```

If Supabase credentials are missing or set to placeholder URLs, the server automatically routes all SQL operations locally to `ever_ready.db` using sqlite.

### 2. Run Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Migrations

### Supabase Setup
Run the SQL queries in [supabase_schema.sql](file:///c:/Users/VISHAL/.gemini/antigravity-ide/scratch/ever_ready_billing/supabase_schema.sql) using the Supabase SQL Editor. This script initializes all schemas, feeds defaults, resets identity column sequences, and disables Row Level Security (RLS) for seamless development.

### SQLite Schema
Running the server automatically calls [getDb()](file:///c:/Users/VISHAL/.gemini/antigravity-ide/scratch/ever_ready_billing/lib/db.js#L7) which handles table definitions and migrations internally.

---

## Feature Log Upgrade (Phase 1–10)

1. **Payment Tracking**:
   * Record multiple dockets of payment actions against single invoices (partial payments, advance settlements, overpayments).
   * Calculates outstanding balances and statuses (`UNPAID`, `PARTIAL`, `PAID`, `OVERPAID`) dynamically.
2. **Timeline Auditing**:
   * Logs auto-generated system timelines on creations, modifications, collections, and deletes.
   * Add custom notes directly in the timeline drawer.
3. **Advanced Filters & Search**:
   * Instant debounced searching.
   * Filters by Status, Date, Min/Max amount, Client account, and GST types. Syncs directly to URL search parameters for link sharing.
4. **Excel & PDF Exporters**:
   * Excel summaries with expandable hierarchical line items outline views.
   * Custom brand printed PDF sheets (Invoice PDF, Receipt slip, Client ledger statement).
5. **Statement Ledger**:
   * Account summary sheets displaying Debit, Credit, and Running balances for clients.
