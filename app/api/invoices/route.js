import { NextResponse } from 'next/server';
import { 
  dbFetchInvoices, 
  dbCreateInvoice, 
  dbUpdateInvoice, 
  dbDeleteInvoice,
  dbCreateComment,
  dbCreateNotification
} from '@/lib/db_helper';

function formatInvoiceItem(item) {
  if (!item) return {};
  return {
    ...item,
    invoiceId: item.invoice_id,
    invoice_id: item.invoice_id,
  };
}

function formatInvoice(invoice) {
  if (!invoice) return {};
  const formattedItems = (invoice.items || []).map(formatInvoiceItem);
  const clientInfo = invoice.clients || {};
  
  return {
    ...invoice,
    // Provide both camelCase and snake_case properties for compatibility
    invoiceNo: invoice.invoice_no,
    invoice_date: invoice.invoice_date,
    invoiceDate: invoice.invoice_date,
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
    discount: invoice.discount || 0,
    transportCharges: invoice.transport_charges || 0,
    transport_charges: invoice.transport_charges || 0,
    
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
      const invoice = await dbFetchInvoices(id);
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json(formatInvoice(invoice));
    } else {
      const invoices = await dbFetchInvoices();
      return NextResponse.json(invoices.map(formatInvoice));
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
      discount,
      transportCharges,
      initialPayment
    } = data;

    if (!invoiceNo || !invoiceDate || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoicePayload = {
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      client_id: parseInt(clientId),
      po_no: poNo || null,
      po_date: poDate || null,
      tax_type: taxType,
      cgst_rate: cgstRate !== undefined ? cgstRate : 9,
      sgst_rate: sgstRate !== undefined ? sgstRate : 9,
      igst_rate: igstRate !== undefined ? igstRate : 18,
      subtotal,
      discount: discount !== undefined ? parseFloat(discount) : 0,
      transport_charges: transportCharges !== undefined ? parseFloat(transportCharges) : 0,
      cgst_amount: cgstAmount !== undefined ? cgstAmount : 0,
      sgst_amount: sgstAmount !== undefined ? sgstAmount : 0,
      igst_amount: igstAmount !== undefined ? igstAmount : 0,
      gross_total: grossTotal
    };

    const formattedItems = items.map(item => ({
      sr: item.sr,
      desc: item.desc || item.description,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total
    }));

    const newInvoice = await dbCreateInvoice(invoicePayload, formattedItems, initialPayment);

    // Create SYSTEM comment for creation
    await dbCreateComment({
      invoice_id: newInvoice.id,
      comment: `Invoice ${invoiceNo} created`,
      comment_type: 'SYSTEM'
    });

    // Create Notification
    await dbCreateNotification({
      type: 'invoice_created',
      title: 'Invoice Created',
      message: `Invoice ${invoiceNo} created successfully`,
      date: 'Just now',
      read: false
    });

    // Fetch full invoice detail to return
    const fullInvoice = await dbFetchInvoices(newInvoice.id);
    return NextResponse.json(formatInvoice(fullInvoice));
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
      discount,
      transportCharges,
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    if (!invoiceNo || !invoiceDate || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoicePayload = {
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      client_id: parseInt(clientId),
      po_no: poNo || null,
      po_date: poDate || null,
      tax_type: taxType,
      cgst_rate: cgstRate !== undefined ? cgstRate : 9,
      sgst_rate: sgstRate !== undefined ? sgstRate : 9,
      igst_rate: igstRate !== undefined ? igstRate : 18,
      subtotal,
      discount: discount !== undefined ? parseFloat(discount) : 0,
      transport_charges: transportCharges !== undefined ? parseFloat(transportCharges) : 0,
      cgst_amount: cgstAmount !== undefined ? cgstAmount : 0,
      sgst_amount: sgstAmount !== undefined ? sgstAmount : 0,
      igst_amount: igstAmount !== undefined ? igstAmount : 0,
      gross_total: grossTotal
    };

    const formattedItems = items.map(item => ({
      sr: item.sr,
      desc: item.desc || item.description,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total
    }));

    await dbUpdateInvoice(id, invoicePayload, formattedItems);

    // Create SYSTEM comment for edit
    await dbCreateComment({
      invoice_id: id,
      comment: `Invoice ${invoiceNo} edited`,
      comment_type: 'SYSTEM'
    });

    // Create Notification
    await dbCreateNotification({
      type: 'invoice_updated',
      title: 'Invoice Updated',
      message: `Invoice ${invoiceNo} updated successfully`,
      date: 'Just now',
      read: false
    });

    const fullInvoice = await dbFetchInvoices(id);
    return NextResponse.json(formatInvoice(fullInvoice));
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

    const invoice = await dbFetchInvoices(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await dbDeleteInvoice(id);

    // Create Notification
    await dbCreateNotification({
      type: 'invoice_deleted',
      title: 'Invoice Deleted',
      message: `Invoice ${invoice.invoice_no} deleted successfully`,
      date: 'Just now',
      read: false
    });

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
