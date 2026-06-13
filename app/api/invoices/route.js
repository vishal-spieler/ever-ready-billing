import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function formatInvoiceItem(item) {
  if (!item) return {};
  return {
    ...item,
    invoiceId: item.invoice_id,
    invoice_id: item.invoice_id,
  };
}

function formatInvoice(invoice, items = []) {
  if (!invoice) return {};
  const formattedItems = items.map(formatInvoiceItem);
  
  // Extract clients details if joined
  const clientInfo = invoice.clients || {};
  
  return {
    ...invoice,
    // Provide both camelCase and snake_case properties for compatibility
    invoiceNo: invoice.invoice_no,
    invoice_no: invoice.invoice_no,
    
    invoiceDate: invoice.invoice_date,
    invoice_date: invoice.invoice_date,
    
    clientId: invoice.client_id,
    client_id: invoice.client_id,
    
    poNo: invoice.po_no,
    po_no: invoice.po_no,
    
    poDate: invoice.po_date,
    po_date: invoice.po_date,
    
    taxType: invoice.tax_type,
    tax_type: invoice.tax_type,
    
    cgstRate: invoice.cgst_rate,
    cgst_rate: invoice.cgst_rate,
    
    sgstRate: invoice.sgst_rate,
    sgst_rate: invoice.sgst_rate,
    
    igstRate: invoice.igst_rate,
    igst_rate: invoice.igst_rate,
    
    cgstAmount: invoice.cgst_amount,
    cgst_amount: invoice.cgst_amount,
    
    sgstAmount: invoice.sgst_amount,
    sgst_amount: invoice.sgst_amount,
    
    igstAmount: invoice.igst_amount,
    igst_amount: invoice.igst_amount,
    
    grossTotal: invoice.gross_total,
    gross_total: invoice.gross_total,
    
    // Flatten client details to mimic SQLite JOIN output structure
    clientName: invoice.clientName || clientInfo.name,
    clientAddress: invoice.clientAddress || clientInfo.address,
    clientCity: invoice.clientCity || clientInfo.city,
    clientPin: invoice.clientPin || clientInfo.pin,
    clientMobile: invoice.clientMobile || clientInfo.mobile,
    clientGstin: invoice.clientGstin || clientInfo.gstin,
    
    items: formattedItems
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch specific invoice with its items
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', id)
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
        .order('sr', { ascending: true });

      if (itemsError) throw itemsError;

      return NextResponse.json(formatInvoice(invoice, items || []));
    } else {
      // Fetch list of all invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, clients(name)')
        .order('id', { ascending: false });

      if (invoicesError) throw invoicesError;

      const formattedInvoices = [];
      for (const inv of (invoices || [])) {
        const { data: items, error: itemsError } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', inv.id)
          .order('sr', { ascending: true });

        if (itemsError) throw itemsError;

        formattedInvoices.push(formatInvoice(inv, items || []));
      }
      
      return NextResponse.json(formattedInvoices);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      invoiceNo,
      invoiceDate,
      clientId,
      poNo,
      poDate,
      items,
      taxType,
      cgstRate,
      sgstRate,
      igstRate,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grossTotal,
    } = data;

    if (!invoiceNo || !invoiceDate || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert Parent Invoice
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([
        {
          invoice_no: invoiceNo,
          invoice_date: invoiceDate,
          client_id: clientId,
          po_no: poNo || null,
          po_date: poDate || null,
          tax_type: taxType,
          cgst_rate: cgstRate !== undefined ? cgstRate : 9,
          sgst_rate: sgstRate !== undefined ? sgstRate : 9,
          igst_rate: igstRate !== undefined ? igstRate : 18,
          subtotal,
          cgst_amount: cgstAmount !== undefined ? cgstAmount : 0,
          sgst_amount: sgstAmount !== undefined ? sgstAmount : 0,
          igst_amount: igstAmount !== undefined ? igstAmount : 0,
          gross_total: grossTotal
        }
      ])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Insert Items
    const itemsToInsert = items.map(item => ({
      invoice_id: newInvoice.id,
      sr: item.sr,
      desc: item.desc,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      // Manual rollback
      await supabase.from('invoices').delete().eq('id', newInvoice.id);
      throw itemsError;
    }

    // Add Notification
    await supabase.from('notifications').insert([
      {
        type: 'invoice_created',
        title: 'Invoice Created',
        message: `Invoice ${invoiceNo} created successfully`,
        date: 'Just now',
        read: false
      }
    ]);

    return NextResponse.json(formatInvoice(newInvoice, newItems || []));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    const {
      id,
      invoiceNo,
      invoiceDate,
      clientId,
      poNo,
      poDate,
      items,
      taxType,
      cgstRate,
      sgstRate,
      igstRate,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      grossTotal,
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    if (!invoiceNo || !invoiceDate || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update Parent Invoice
    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .update({
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        client_id: clientId,
        po_no: poNo || null,
        po_date: poDate || null,
        tax_type: taxType,
        cgst_rate: cgstRate !== undefined ? cgstRate : 9,
        sgst_rate: sgstRate !== undefined ? sgstRate : 9,
        igst_rate: igstRate !== undefined ? igstRate : 18,
        subtotal,
        cgst_amount: cgstAmount !== undefined ? cgstAmount : 0,
        sgst_amount: sgstAmount !== undefined ? sgstAmount : 0,
        igst_amount: igstAmount !== undefined ? igstAmount : 0,
        gross_total: grossTotal
      })
      .eq('id', id)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    if (deleteError) throw deleteError;

    // Insert New Items
    const itemsToInsert = items.map(item => ({
      invoice_id: id,
      sr: item.sr,
      desc: item.desc || item.description,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) throw itemsError;

    // Add Notification
    await supabase.from('notifications').insert([
      {
        type: 'invoice_updated',
        title: 'Invoice Updated',
        message: `Invoice ${invoiceNo} updated successfully`,
        date: 'Just now',
        read: false
      }
    ]);

    return NextResponse.json(formatInvoice(updatedInvoice, newItems || []));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Fetch invoice details for notifications
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('invoice_no')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete invoice items manually first
    const { error: deleteItemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    if (deleteItemsError) throw deleteItemsError;

    const { error: deleteInvoiceError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (deleteInvoiceError) throw deleteInvoiceError;
    
    // Add Notification
    await supabase.from('notifications').insert([
      {
        type: 'invoice_deleted',
        title: 'Invoice Deleted',
        message: `Invoice ${invoice.invoice_no} deleted successfully`,
        date: 'Just now',
        read: false
      }
    ]);

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
