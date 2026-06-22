import { supabase } from './supabase';

// getDb is imported dynamically (not statically) so that sqlite3 is never
// loaded at build time on Vercel — it is only evaluated at request time when
// Supabase is not configured.
async function getDb() {
  const { getDb: _getDb } = await import('./db');
  return _getDb();
}

export function isSupabaseAvailable() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  return !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
}

// Helper to convert SQLite numeric responses to JS Numbers
function normalizeRow(row) {
  if (!row) return row;
  const normalized = { ...row };
  // Convert 1/0 to true/false for read flags or status booleans where necessary
  if (normalized.hasOwnProperty('read') && typeof normalized.read === 'number') {
    normalized.read = normalized.read === 1;
  }
  return normalized;
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchSettings() {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    const row = await db.get('SELECT * FROM company_settings WHERE id = 1');
    return normalizeRow(row);
  }
}

export async function dbUpdateSettings(settings) {
  if (isSupabaseAvailable()) {
    // Check existence
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    let result, error;
    if (existing) {
      ({ data: result, error } = await supabase
        .from('company_settings')
        .update(settings)
        .eq('id', 1)
        .select()
        .single());
    } else {
      ({ data: result, error } = await supabase
        .from('company_settings')
        .insert([{ id: 1, ...settings }])
        .select()
        .single());
    }
    if (error) throw error;
    return result;
  } else {
    const db = await getDb();
    const existing = await db.get('SELECT id FROM company_settings WHERE id = 1');
    if (existing) {
      await db.run(
        `UPDATE company_settings SET 
          name = ?, address = ?, phone = ?, email = ?, gstin = ?, pan = ?, 
          bank_name = ?, bank_branch = ?, account_name = ?, account_no = ?, ifsc_code = ?
         WHERE id = 1`,
        [
          settings.name, settings.address, settings.phone, settings.email, settings.gstin, settings.pan,
          settings.bank_name, settings.bank_branch, settings.account_name, settings.account_no, settings.ifsc_code
        ]
      );
    } else {
      await db.run(
        `INSERT INTO company_settings (id, name, address, phone, email, gstin, pan, bank_name, bank_branch, account_name, account_no, ifsc_code)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.name, settings.address, settings.phone, settings.email, settings.gstin, settings.pan,
          settings.bank_name, settings.bank_branch, settings.account_name, settings.account_no, settings.ifsc_code
        ]
      );
    }
    return dbFetchSettings();
  }
}

// ═══════════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchClients(id = null) {
  if (isSupabaseAvailable()) {
    if (id) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  } else {
    const db = await getDb();
    if (id) {
      const row = await db.get('SELECT * FROM clients WHERE id = ?', [id]);
      return normalizeRow(row);
    } else {
      const rows = await db.all('SELECT * FROM clients ORDER BY name ASC');
      return rows.map(normalizeRow);
    }
  }
}

export async function dbCreateClient(client) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO clients (name, contact_person, mobile, email, address, city, state, pin, gstin, pan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client.name, client.contact_person, client.mobile, client.email, client.address,
        client.city, client.state, client.pin, client.gstin, client.pan
      ]
    );
    return dbFetchClients(result.lastID);
  }
}

export async function dbUpdateClient(id, client) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    await db.run(
      `UPDATE clients SET 
        name = ?, contact_person = ?, mobile = ?, email = ?, address = ?, 
        city = ?, state = ?, pin = ?, gstin = ?, pan = ?
       WHERE id = ?`,
      [
        client.name, client.contact_person, client.mobile, client.email, client.address,
        client.city, client.state, client.pin, client.gstin, client.pan, id
      ]
    );
    return dbFetchClients(id);
  }
}

export async function dbDeleteClient(id) {
  if (isSupabaseAvailable()) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM clients WHERE id = ?', [id]);
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// INVOICES & PAYMENTS CALCULATIONS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchInvoices(id = null) {
  if (isSupabaseAvailable()) {
    if (id) {
      // Fetch specific invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', id)
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoice) return null;

      // Fetch items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
        .order('sr', { ascending: true });

      if (itemsError) throw itemsError;

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', id)
        .order('payment_date', { ascending: true });

      if (paymentsError) throw paymentsError;

      const total_paid = payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0;
      const remaining_amount = invoice.gross_total - total_paid;
      
      let payment_status = 'UNPAID';
      if (total_paid > 0) {
        if (parseFloat(total_paid.toFixed(2)) === parseFloat(invoice.gross_total.toFixed(2))) {
          payment_status = 'PAID';
        } else if (total_paid > invoice.gross_total) {
          payment_status = 'OVERPAID';
        } else {
          payment_status = 'PARTIAL';
        }
      }

      return {
        ...invoice,
        items: items || [],
        payments: payments || [],
        total_paid: parseFloat(total_paid.toFixed(2)),
        remaining_amount: parseFloat(remaining_amount.toFixed(2)),
        payment_status
      };
    } else {
      // Fetch list
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('id', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Fetch all payments to aggregate
      const { data: allPayments, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('invoice_id, amount');

      if (paymentsError) throw paymentsError;

      const paymentMap = (allPayments || []).reduce((acc, p) => {
        acc[p.invoice_id] = (acc[p.invoice_id] || 0) + p.amount;
        return acc;
      }, {});

      return invoices.map(inv => {
        const total_paid = paymentMap[inv.id] || 0;
        const remaining_amount = inv.gross_total - total_paid;
        let payment_status = 'UNPAID';
        if (total_paid > 0) {
          if (parseFloat(total_paid.toFixed(2)) === parseFloat(inv.gross_total.toFixed(2))) {
            payment_status = 'PAID';
          } else if (total_paid > inv.gross_total) {
            payment_status = 'OVERPAID';
          } else {
            payment_status = 'PARTIAL';
          }
        }
        return {
          ...inv,
          total_paid: parseFloat(total_paid.toFixed(2)),
          remaining_amount: parseFloat(remaining_amount.toFixed(2)),
          payment_status
        };
      });
    }
  } else {
    const db = await getDb();
    if (id) {
      const invoice = await db.get(
        `SELECT invoices.*, 
                clients.name as client_name, clients.contact_person, clients.mobile, clients.email, 
                clients.address as client_address, clients.city as client_city, clients.state as client_state, 
                clients.pin as client_pin, clients.gstin as client_gstin, clients.pan as client_pan
         FROM invoices
         LEFT JOIN clients ON invoices.client_id = clients.id
         WHERE invoices.id = ?`,
        [id]
      );
      if (!invoice) return null;

      // Reshape client sub-object to mimic Supabase join
      invoice.clients = {
        name: invoice.client_name,
        contact_person: invoice.contact_person,
        mobile: invoice.mobile,
        email: invoice.email,
        address: invoice.client_address,
        city: invoice.client_city,
        state: invoice.client_state,
        pin: invoice.client_pin,
        gstin: invoice.client_gstin,
        pan: invoice.client_pan
      };

      const items = await db.all('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sr ASC', [id]);
      const payments = await db.all('SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY payment_date ASC', [id]);

      const total_paid = payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining_amount = invoice.gross_total - total_paid;
      let payment_status = 'UNPAID';
      if (total_paid > 0) {
        if (parseFloat(total_paid.toFixed(2)) === parseFloat(invoice.gross_total.toFixed(2))) {
          payment_status = 'PAID';
        } else if (total_paid > invoice.gross_total) {
          payment_status = 'OVERPAID';
        } else {
          payment_status = 'PARTIAL';
        }
      }

      return {
        ...normalizeRow(invoice),
        items: items.map(normalizeRow),
        payments: payments.map(normalizeRow),
        total_paid: parseFloat(total_paid.toFixed(2)),
        remaining_amount: parseFloat(remaining_amount.toFixed(2)),
        payment_status
      };
    } else {
      const invoices = await db.all(
        `SELECT invoices.*, clients.name as client_name 
         FROM invoices
         LEFT JOIN clients ON invoices.client_id = clients.id
         ORDER BY invoices.id DESC`
      );

      const allPayments = await db.all('SELECT invoice_id, amount FROM invoice_payments');
      const paymentMap = allPayments.reduce((acc, p) => {
        acc[p.invoice_id] = (acc[p.invoice_id] || 0) + p.amount;
        return acc;
      }, {});

      return invoices.map(inv => {
        // Reshape clients structure
        inv.clients = { name: inv.client_name };
        
        const total_paid = paymentMap[inv.id] || 0;
        const remaining_amount = inv.gross_total - total_paid;
        let payment_status = 'UNPAID';
        if (total_paid > 0) {
          if (parseFloat(total_paid.toFixed(2)) === parseFloat(inv.gross_total.toFixed(2))) {
            payment_status = 'PAID';
          } else if (total_paid > inv.gross_total) {
            payment_status = 'OVERPAID';
          } else {
            payment_status = 'PARTIAL';
          }
        }
        return {
          ...normalizeRow(inv),
          total_paid: parseFloat(total_paid.toFixed(2)),
          remaining_amount: parseFloat(remaining_amount.toFixed(2)),
          payment_status
        };
      });
    }
  }
}

export async function dbCreateInvoice(invoice, items, initialPayment = null) {
  if (isSupabaseAvailable()) {
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    const itemsToInsert = items.map(item => ({
      invoice_id: newInvoice.id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // rollback
      await supabase.from('invoices').delete().eq('id', newInvoice.id);
      throw itemsError;
    }

    if (initialPayment) {
      const paymentPayload = {
        invoice_id: newInvoice.id,
        payment_date: initialPayment.paymentDate,
        amount: parseFloat(initialPayment.amount),
        payment_mode: initialPayment.paymentMode,
        reference_number: initialPayment.referenceNumber || null,
        notes: initialPayment.notes || null
      };

      const { error: paymentError } = await supabase
        .from('invoice_payments')
        .insert([paymentPayload]);

      if (paymentError) {
        // rollback items and invoice
        await supabase.from('invoice_items').delete().eq('invoice_id', newInvoice.id);
        await supabase.from('invoices').delete().eq('id', newInvoice.id);
        throw paymentError;
      }

      // Record system comment
      await supabase.from('invoice_comments').insert([{
        invoice_id: newInvoice.id,
        comment: `Initial payment of ₹${paymentPayload.amount} recorded (${paymentPayload.payment_mode})`,
        comment_type: 'SYSTEM'
      }]);
    }

    return newInvoice;
  } else {
    const db = await getDb();
    // Wrap in a transaction or manual rollback
    try {
      await db.run('BEGIN TRANSACTION');
      
      const result = await db.run(
        `INSERT INTO invoices (
          invoice_no, invoice_date, client_id, po_no, po_date, tax_type, 
          cgst_rate, sgst_rate, igst_rate, subtotal, discount, transport_charges,
          cgst_amount, sgst_amount, igst_amount, gross_total
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.invoice_no, invoice.invoice_date, invoice.client_id, invoice.po_no, invoice.po_date, invoice.tax_type,
          invoice.cgst_rate, invoice.sgst_rate, invoice.igst_rate, invoice.subtotal,
          invoice.discount || 0, invoice.transport_charges || 0,
          invoice.cgst_amount, invoice.sgst_amount, invoice.igst_amount, invoice.gross_total
        ]
      );
      const invoiceId = result.lastID;

      for (const item of items) {
        await db.run(
          `INSERT INTO invoice_items (invoice_id, sr, desc, hsn, qty, rate, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.sr, item.desc, item.hsn, item.qty, item.rate, item.total]
        );
      }

      if (initialPayment) {
        const amt = parseFloat(initialPayment.amount);
        await db.run(
          `INSERT INTO invoice_payments (invoice_id, payment_date, amount, payment_mode, reference_number, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, initialPayment.paymentDate, amt, initialPayment.paymentMode, initialPayment.referenceNumber || null, initialPayment.notes || null]
        );

        await db.run(
          `INSERT INTO invoice_comments (invoice_id, comment, comment_type, created_at)
           VALUES (?, ?, 'SYSTEM', datetime('now'))`,
          [invoiceId, `Initial payment of ₹${amt} recorded (${initialPayment.paymentMode})`]
        );
      }

      await db.run('COMMIT');
      return { id: invoiceId, ...invoice };
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }
}

export async function dbUpdateInvoice(id, invoice, items) {
  if (isSupabaseAvailable()) {
    const { data: updated, error: invoiceError } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Delete and replace items
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    if (deleteError) throw deleteError;

    const itemsToInsert = items.map(item => ({
      invoice_id: id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return updated;
  } else {
    const db = await getDb();
    try {
      await db.run('BEGIN TRANSACTION');

      await db.run(
        `UPDATE invoices SET 
          invoice_no = ?, invoice_date = ?, client_id = ?, po_no = ?, po_date = ?, tax_type = ?, 
          cgst_rate = ?, sgst_rate = ?, igst_rate = ?, subtotal = ?,
          discount = ?, transport_charges = ?,
          cgst_amount = ?, sgst_amount = ?, igst_amount = ?, gross_total = ?
         WHERE id = ?`,
        [
          invoice.invoice_no, invoice.invoice_date, invoice.client_id, invoice.po_no, invoice.po_date, invoice.tax_type,
          invoice.cgst_rate, invoice.sgst_rate, invoice.igst_rate, invoice.subtotal,
          invoice.discount || 0, invoice.transport_charges || 0,
          invoice.cgst_amount, invoice.sgst_amount, invoice.igst_amount, invoice.gross_total, id
        ]
      );

      await db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

      for (const item of items) {
        await db.run(
          `INSERT INTO invoice_items (invoice_id, sr, desc, hsn, qty, rate, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, item.sr, item.desc, item.hsn, item.qty, item.rate, item.total]
        );
      }

      await db.run('COMMIT');
      return { id, ...invoice };
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }
}

export async function dbDeleteInvoice(id) {
  if (isSupabaseAvailable()) {
    // Delete cascading items first manually (just in case)
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    await supabase.from('invoice_payments').delete().eq('invoice_id', id);
    await supabase.from('invoice_comments').delete().eq('invoice_id', id);

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    await db.run('DELETE FROM invoice_payments WHERE invoice_id = ?', [id]);
    await db.run('DELETE FROM invoice_comments WHERE invoice_id = ?', [id]);
    await db.run('DELETE FROM invoices WHERE id = ?', [id]);
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchPayments(invoiceId = null) {
  if (isSupabaseAvailable()) {
    let query = supabase.from('invoice_payments').select('*, invoices(invoice_no, gross_total, clients(name))');
    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }
    const { data, error } = await query.order('payment_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    const db = await getDb();
    let queryStr = `
      SELECT invoice_payments.*, invoices.invoice_no, invoices.gross_total, clients.name as client_name
      FROM invoice_payments
      LEFT JOIN invoices ON invoice_payments.invoice_id = invoices.id
      LEFT JOIN clients ON invoices.client_id = clients.id
    `;
    let params = [];
    if (invoiceId) {
      queryStr += ' WHERE invoice_payments.invoice_id = ?';
      params.push(invoiceId);
    }
    queryStr += ' ORDER BY invoice_payments.payment_date DESC';
    const rows = await db.all(queryStr, params);
    
    return rows.map(row => {
      const normalized = normalizeRow(row);
      // Mock Supabase nested object structures
      normalized.invoices = {
        invoice_no: normalized.invoice_no,
        gross_total: normalized.gross_total,
        clients: { name: normalized.client_name }
      };
      return normalized;
    });
  }
}

export async function dbCreatePayment(payment) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('invoice_payments')
      .insert([payment])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO invoice_payments (invoice_id, payment_date, amount, payment_mode, reference_number, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [payment.invoice_id, payment.payment_date, payment.amount, payment.payment_mode, payment.reference_number, payment.notes]
    );
    const id = result.lastID;
    const inserted = await db.get('SELECT * FROM invoice_payments WHERE id = ?', [id]);
    return normalizeRow(inserted);
  }
}

export async function dbUpdatePayment(id, payment) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('invoice_payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    await db.run(
      `UPDATE invoice_payments SET 
        payment_date = ?, amount = ?, payment_mode = ?, reference_number = ?, notes = ?
       WHERE id = ?`,
      [payment.payment_date, payment.amount, payment.payment_mode, payment.reference_number, payment.notes, id]
    );
    const updated = await db.get('SELECT * FROM invoice_payments WHERE id = ?', [id]);
    return normalizeRow(updated);
  }
}

export async function dbDeletePayment(id) {
  if (isSupabaseAvailable()) {
    const { error } = await supabase
      .from('invoice_payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM invoice_payments WHERE id = ?', [id]);
    return true;
  }
}

export async function dbFetchPaymentById(id) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('invoice_payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    const row = await db.get('SELECT * FROM invoice_payments WHERE id = ?', [id]);
    return normalizeRow(row);
  }
}

// ═══════════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchComments(invoiceId) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('invoice_comments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    const db = await getDb();
    const rows = await db.all(
      'SELECT * FROM invoice_comments WHERE invoice_id = ? ORDER BY created_at DESC',
      [invoiceId]
    );
    return rows.map(normalizeRow);
  }
}

export async function dbCreateComment(comment) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('invoice_comments')
      .insert([comment])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO invoice_comments (invoice_id, comment, comment_type, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [comment.invoice_id, comment.comment, comment.comment_type]
    );
    const id = result.lastID;
    const inserted = await db.get('SELECT * FROM invoice_comments WHERE id = ?', [id]);
    return normalizeRow(inserted);
  }
}

// ═══════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchNotifications() {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM notifications ORDER BY id DESC');
    return rows.map(normalizeRow);
  }
}

export async function dbCreateNotification(notification) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO notifications (type, title, message, date, read)
       VALUES (?, ?, ?, ?, ?)`,
      [notification.type, notification.title, notification.message, notification.date, notification.read ? 1 : 0]
    );
    const id = result.lastID;
    const inserted = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);
    return normalizeRow(inserted);
  }
}

export async function dbUpdateNotification(id, updates) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    if (updates.hasOwnProperty('read')) {
      await db.run('UPDATE notifications SET read = ? WHERE id = ?', [updates.read ? 1 : 0, id]);
    }
    const updated = await db.get('SELECT * FROM notifications WHERE id = ?', [id]);
    return normalizeRow(updated);
  }
}

export async function dbDeleteNotification(id) {
  if (isSupabaseAvailable()) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM notifications WHERE id = ?', [id]);
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// QUOTATIONS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchQuotations(id = null) {
  if (isSupabaseAvailable()) {
    if (id) {
      const { data: quotation, error: quotError } = await supabase
        .from('quotations')
        .select('*, clients(*)')
        .eq('id', id)
        .maybeSingle();

      if (quotError) throw quotError;
      if (!quotation) return null;

      const { data: items, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .order('sr', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...quotation,
        items: items || []
      };
    } else {
      const { data: quotations, error: quotationsError } = await supabase
        .from('quotations')
        .select('*, clients(name)')
        .order('id', { ascending: false });

      if (quotationsError) throw quotationsError;

      const formatted = [];
      for (const quot of (quotations || [])) {
        const { data: items, error: itemsError } = await supabase
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', quot.id)
          .order('sr', { ascending: true });

        if (itemsError) throw itemsError;
        formatted.push({ ...quot, items: items || [] });
      }
      return formatted;
    }
  } else {
    const db = await getDb();
    if (id) {
      const quotation = await db.get(
        `SELECT quotations.*, 
                clients.name as client_name, clients.contact_person, clients.mobile, clients.email, 
                clients.address as client_address, clients.city as client_city, clients.state as client_state, 
                clients.pin as client_pin, clients.gstin as client_gstin, clients.pan as client_pan
         FROM quotations
         LEFT JOIN clients ON quotations.client_id = clients.id
         WHERE quotations.id = ?`,
        [id]
      );
      if (!quotation) return null;

      // Mock join structures
      quotation.clients = {
        name: quotation.client_name,
        contact_person: quotation.contact_person,
        mobile: quotation.mobile,
        email: quotation.email,
        address: quotation.client_address,
        city: quotation.client_city,
        state: quotation.client_state,
        pin: quotation.client_pin,
        gstin: quotation.client_gstin,
        pan: quotation.client_pan
      };

      const items = await db.all('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sr ASC', [id]);
      return {
        ...normalizeRow(quotation),
        items: items.map(normalizeRow)
      };
    } else {
      const quotations = await db.all(
        `SELECT quotations.*, clients.name as client_name 
         FROM quotations
         LEFT JOIN clients ON quotations.client_id = clients.id
         ORDER BY quotations.id DESC`
      );

      const formatted = [];
      for (const quot of quotations) {
        quot.clients = { name: quot.client_name };
        const items = await db.all('SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY sr ASC', [quot.id]);
        formatted.push({
          ...normalizeRow(quot),
          items: items.map(normalizeRow)
        });
      }
      return formatted;
    }
  }
}

export async function dbCreateQuotation(quotation, items) {
  if (isSupabaseAvailable()) {
    const { data: newQuot, error: quotError } = await supabase
      .from('quotations')
      .insert([quotation])
      .select()
      .single();

    if (quotError) throw quotError;

    const itemsToInsert = items.map(item => ({
      quotation_id: newQuot.id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert);

    if (itemsError) {
      await supabase.from('quotations').delete().eq('id', newQuot.id);
      throw itemsError;
    }

    return newQuot;
  } else {
    const db = await getDb();
    try {
      await db.run('BEGIN TRANSACTION');

      const result = await db.run(
        `INSERT INTO quotations (
          quotation_no, quotation_date, valid_until, client_id, tax_type, 
          cgst_rate, sgst_rate, igst_rate, subtotal, discount, transport_charges,
          cgst_amount, sgst_amount, igst_amount, gross_total, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotation.quotation_no, quotation.quotation_date, quotation.valid_until, quotation.client_id, quotation.tax_type,
          quotation.cgst_rate, quotation.sgst_rate, quotation.igst_rate, quotation.subtotal,
          quotation.discount || 0, quotation.transport_charges || 0,
          quotation.cgst_amount, quotation.sgst_amount, quotation.igst_amount, quotation.gross_total, quotation.status
        ]
      );
      const quotId = result.lastID;

      for (const item of items) {
        await db.run(
          `INSERT INTO quotation_items (quotation_id, sr, desc, hsn, qty, rate, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [quotId, item.sr, item.desc, item.hsn, item.qty, item.rate, item.total]
        );
      }

      await db.run('COMMIT');
      return { id: quotId, ...quotation };
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }
}

export async function dbUpdateQuotation(id, quotation, items) {
  if (isSupabaseAvailable()) {
    const { data: updated, error: quotError } = await supabase
      .from('quotations')
      .update(quotation)
      .eq('id', id)
      .select()
      .single();

    if (quotError) throw quotError;

    await supabase.from('quotation_items').delete().eq('quotation_id', id);

    const itemsToInsert = items.map(item => ({
      quotation_id: id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return updated;
  } else {
    const db = await getDb();
    try {
      await db.run('BEGIN TRANSACTION');

      await db.run(
        `UPDATE quotations SET 
          quotation_no = ?, quotation_date = ?, valid_until = ?, client_id = ?, tax_type = ?, 
          cgst_rate = ?, sgst_rate = ?, igst_rate = ?, subtotal = ?,
          discount = ?, transport_charges = ?,
          cgst_amount = ?, sgst_amount = ?, igst_amount = ?, gross_total = ?, status = ?
         WHERE id = ?`,
        [
          quotation.quotation_no, quotation.quotation_date, quotation.valid_until, quotation.client_id, quotation.tax_type,
          quotation.cgst_rate, quotation.sgst_rate, quotation.igst_rate, quotation.subtotal,
          quotation.discount || 0, quotation.transport_charges || 0,
          quotation.cgst_amount, quotation.sgst_amount, quotation.igst_amount, quotation.gross_total, quotation.status, id
        ]
      );

      await db.run('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);

      for (const item of items) {
        await db.run(
          `INSERT INTO quotation_items (quotation_id, sr, desc, hsn, qty, rate, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, item.sr, item.desc, item.hsn, item.qty, item.rate, item.total]
        );
      }

      await db.run('COMMIT');
      return { id, ...quotation };
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }
}

export async function dbDeleteQuotation(id) {
  if (isSupabaseAvailable()) {
    await supabase.from('quotation_items').delete().eq('quotation_id', id);
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);
    await db.run('DELETE FROM quotations WHERE id = ?', [id]);
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTH / CREDENTIALS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchCredentials() {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('company_settings')
      .select('login_username, login_password')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    return data || { login_username: 'admin', login_password: 'admin123' };
  } else {
    const db = await getDb();
    const row = await db.get('SELECT login_username, login_password FROM company_settings WHERE id = 1');
    return row || { login_username: 'admin', login_password: 'admin123' };
  }
}

export async function dbUpdatePassword(newPassword) {
  if (isSupabaseAvailable()) {
    const { data, error } = await supabase
      .from('company_settings')
      .update({ login_password: newPassword })
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const db = await getDb();
    await db.run('UPDATE company_settings SET login_password = ? WHERE id = 1', [newPassword]);
    return { success: true };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchPurchaseOrders(id = null) {
  if (isSupabaseAvailable()) {
    if (id) {
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select('*, clients(*)')
        .eq('id', id)
        .maybeSingle();

      if (poError) throw poError;
      if (!po) return null;

      const { data: items, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', id)
        .order('sr', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...po,
        items: items || []
      };
    } else {
      const { data: pos, error: posError } = await supabase
        .from('purchase_orders')
        .select('*, clients(name)')
        .order('id', { ascending: false });

      if (posError) throw posError;

      const formatted = [];
      for (const po of (pos || [])) {
        const { data: items, error: itemsError } = await supabase
          .from('purchase_order_items')
          .select('*')
          .eq('purchase_order_id', po.id)
          .order('sr', { ascending: true });

        if (itemsError) throw itemsError;
        formatted.push({ ...po, items: items || [] });
      }
      return formatted;
    }
  } else {
    const db = await getDb();
    if (id) {
      const po = await db.get(
        `SELECT purchase_orders.*, 
                clients.name as client_name, clients.contact_person, clients.mobile, clients.email, 
                clients.address as client_address, clients.city as client_city, clients.state as client_state, 
                clients.pin as client_pin, clients.gstin as client_gstin, clients.pan as client_pan
         FROM purchase_orders
         LEFT JOIN clients ON purchase_orders.client_id = clients.id
         WHERE purchase_orders.id = ?`,
        [id]
      );
      if (!po) return null;

      po.clients = {
        name: po.client_name,
        contact_person: po.contact_person,
        mobile: po.mobile,
        email: po.email,
        address: po.client_address,
        city: po.client_city,
        state: po.client_state,
        pin: po.client_pin,
        gstin: po.client_gstin,
        pan: po.client_pan
      };

      const items = await db.all('SELECT * FROM purchase_order_items WHERE purchase_order_id = ? ORDER BY sr ASC', [id]);
      return {
        ...normalizeRow(po),
        items: items.map(normalizeRow)
      };
    } else {
      const pos = await db.all(
        `SELECT purchase_orders.*, clients.name as client_name 
         FROM purchase_orders
         LEFT JOIN clients ON purchase_orders.client_id = clients.id
         ORDER BY purchase_orders.id DESC`
      );

      const formatted = [];
      for (const po of pos) {
        po.clients = { name: po.client_name };
        const items = await db.all('SELECT * FROM purchase_order_items WHERE purchase_order_id = ? ORDER BY sr ASC', [po.id]);
        formatted.push({
          ...normalizeRow(po),
          items: items.map(normalizeRow)
        });
      }
      return formatted;
    }
  }
}

export async function dbCreatePurchaseOrder(po, items) {
  if (isSupabaseAvailable()) {
    const { data: newPO, error: poError } = await supabase
      .from('purchase_orders')
      .insert([po])
      .select()
      .single();

    if (poError) throw poError;

    const itemsToInsert = items.map(item => ({
      purchase_order_id: newPO.id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      await supabase.from('purchase_orders').delete().eq('id', newPO.id);
      throw itemsError;
    }

    return newPO;
  } else {
    const db = await getDb();
    try {
      await db.run('BEGIN TRANSACTION');

      const result = await db.run(
        `INSERT INTO purchase_orders (
          po_no, po_date, valid_until, client_id, vendor_or_client, tax_type, 
          cgst_rate, sgst_rate, igst_rate, subtotal, discount, transport_charges,
          cgst_amount, sgst_amount, igst_amount, gross_total, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          po.po_no, po.po_date, po.valid_until, po.client_id, po.vendor_or_client || 'CLIENT', po.tax_type,
          po.cgst_rate, po.sgst_rate, po.igst_rate, po.subtotal,
          po.discount || 0, po.transport_charges || 0,
          po.cgst_amount, po.sgst_amount, po.igst_amount, po.gross_total, po.status || 'PENDING'
        ]
      );
      const poId = result.lastID;

      for (const item of items) {
        await db.run(
          `INSERT INTO purchase_order_items (purchase_order_id, sr, desc, hsn, qty, rate, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [poId, item.sr, item.desc, item.hsn, item.qty, item.rate, item.total]
        );
      }

      await db.run('COMMIT');
      return { id: poId, ...po };
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }
}

export async function dbUpdatePurchaseOrder(id, po, items) {
  if (isSupabaseAvailable()) {
    const { data: updated, error: poError } = await supabase
      .from('purchase_orders')
      .update(po)
      .eq('id', id)
      .select()
      .single();

    if (poError) throw poError;

    await supabase.from('purchase_order_items').delete().eq('purchase_order_id', id);

    const itemsToInsert = items.map(item => ({
      purchase_order_id: id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return updated;
  } else {
    const db = await getDb();
    try {
      await db.run('BEGIN TRANSACTION');

      await db.run(
        `UPDATE purchase_orders SET 
          po_no = ?, po_date = ?, valid_until = ?, client_id = ?, vendor_or_client = ?, tax_type = ?, 
          cgst_rate = ?, sgst_rate = ?, igst_rate = ?, subtotal = ?,
          discount = ?, transport_charges = ?,
          cgst_amount = ?, sgst_amount = ?, igst_amount = ?, gross_total = ?, status = ?
         WHERE id = ?`,
        [
          po.po_no, po.po_date, po.valid_until, po.client_id, po.vendor_or_client || 'CLIENT', po.tax_type,
          po.cgst_rate, po.sgst_rate, po.igst_rate, po.subtotal,
          po.discount || 0, po.transport_charges || 0,
          po.cgst_amount, po.sgst_amount, po.igst_amount, po.gross_total, po.status, id
        ]
      );

      await db.run('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);

      for (const item of items) {
        await db.run(
          `INSERT INTO purchase_order_items (purchase_order_id, sr, desc, hsn, qty, rate, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, item.sr, item.desc, item.hsn, item.qty, item.rate, item.total]
        );
      }

      await db.run('COMMIT');
      return { id, ...po };
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }
}

export async function dbDeletePurchaseOrder(id) {
  if (isSupabaseAvailable()) {
    await supabase.from('purchase_order_items').delete().eq('purchase_order_id', id);
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
    await db.run('DELETE FROM purchase_orders WHERE id = ?', [id]);
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════
// UPLOADED PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════

export async function dbFetchUploadedPOs(clientId = null) {
  if (isSupabaseAvailable()) {
    let query = supabase.from('uploaded_pos').select('*, clients(name)');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    const { data, error } = await query.order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    const db = await getDb();
    let queryStr = `
      SELECT uploaded_pos.*, clients.name as client_name
      FROM uploaded_pos
      LEFT JOIN clients ON uploaded_pos.client_id = clients.id
    `;
    let params = [];
    if (clientId) {
      queryStr += ' WHERE uploaded_pos.client_id = ?';
      params.push(clientId);
    }
    queryStr += ' ORDER BY uploaded_pos.id DESC';
    const rows = await db.all(queryStr, params);
    return rows.map(row => {
      const normalized = normalizeRow(row);
      normalized.clients = { name: normalized.client_name };
      return normalized;
    });
  }
}

export async function dbCreateUploadedPO(data) {
  if (isSupabaseAvailable()) {
    const { data: result, error } = await supabase
      .from('uploaded_pos')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  } else {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO uploaded_pos (client_id, vendor_or_client, file_name, file_type, file_data, upload_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.client_id, data.vendor_or_client || 'CLIENT', data.file_name, data.file_type, data.file_data, data.upload_date, data.notes]
    );
    const id = result.lastID;
    const inserted = await db.get(
      `SELECT uploaded_pos.*, clients.name as client_name
       FROM uploaded_pos
       LEFT JOIN clients ON uploaded_pos.client_id = clients.id
       WHERE uploaded_pos.id = ?`,
      [id]
    );
    const normalized = normalizeRow(inserted);
    normalized.clients = { name: normalized.client_name };
    return normalized;
  }
}

export async function dbDeleteUploadedPO(id) {
  if (isSupabaseAvailable()) {
    const { error } = await supabase
      .from('uploaded_pos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } else {
    const db = await getDb();
    await db.run('DELETE FROM uploaded_pos WHERE id = ?', [id]);
    return true;
  }
}
