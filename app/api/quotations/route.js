import { NextResponse } from 'next/server';
import { 
  dbFetchQuotations, 
  dbCreateQuotation, 
  dbUpdateQuotation, 
  dbDeleteQuotation,
  dbCreateNotification 
} from '@/lib/db_helper';

function formatQuotationItem(item) {
  if (!item) return {};
  return {
    ...item,
    quotationId: item.quotation_id,
    quotation_id: item.quotation_id,
    uom: item.uom || 'Nos',
    cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
    cgst_rate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
    sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9),
    sgst_rate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
  };
}

function formatQuotation(quotation) {
  if (!quotation) return {};
  const formattedItems = (quotation.items || []).map(formatQuotationItem);
  const clientInfo = quotation.clients || {};
  
  return {
    ...quotation,
    // Provide both camelCase and snake_case properties for compatibility
    quotationNo: quotation.quotation_no,
    quotation_no: quotation.quotation_no,
    quotationDate: quotation.quotation_date,
    quotation_date: quotation.quotation_date,
    validUntil: quotation.valid_until,
    valid_until: quotation.valid_until,
    clientId: quotation.client_id,
    client_id: quotation.client_id,
    taxType: quotation.tax_type,
    tax_type: quotation.tax_type,
    cgstRate: quotation.cgst_rate,
    cgst_rate: quotation.cgst_rate,
    sgstRate: quotation.sgst_rate,
    sgst_rate: quotation.sgst_rate,
    igstRate: quotation.igst_rate,
    igst_rate: quotation.igst_rate,
    cgstAmount: quotation.cgst_amount,
    cgst_amount: quotation.cgst_amount,
    sgstAmount: quotation.sgst_amount,
    sgst_amount: quotation.sgst_amount,
    igstAmount: quotation.igst_amount,
    igst_amount: quotation.igst_amount,
    grossTotal: quotation.gross_total,
    gross_total: quotation.gross_total,
    discount: quotation.discount || 0,
    transportCharges: quotation.transport_charges || 0,
    transport_charges: quotation.transport_charges || 0,
    status: quotation.status,
    
    // Flatten client details to mimic SQLite JOIN output structure
    clientName: quotation.clientName || clientInfo.name,
    clientAddress: quotation.clientAddress || clientInfo.address,
    clientCity: quotation.clientCity || clientInfo.city,
    clientPin: quotation.clientPin || clientInfo.pin,
    clientMobile: quotation.clientMobile || clientInfo.mobile,
    clientGstin: quotation.clientGstin || clientInfo.gstin,
    
    items: formattedItems
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const quotation = await dbFetchQuotations(id);
      if (!quotation) {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
      }
      return NextResponse.json(formatQuotation(quotation));
    } else {
      const quotations = await dbFetchQuotations();
      return NextResponse.json(quotations.map(formatQuotation));
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      quotationNo,
      quotationDate,
      validUntil,
      clientId,
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
      status = 'PENDING',
    } = data;

    if (!quotationNo || !quotationDate || !validUntil || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quotationPayload = {
      quotation_no: quotationNo,
      quotation_date: quotationDate,
      valid_until: validUntil,
      client_id: parseInt(clientId),
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
      gross_total: grossTotal,
      status
    };

    const formattedItems = items.map(item => ({
      sr: item.sr,
      desc: item.desc || item.description,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total,
      uom: item.uom || 'Nos',
      cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
      sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
    }));

    const newQuotation = await dbCreateQuotation(quotationPayload, formattedItems);

    // Add Notification
    await dbCreateNotification({
      type: 'quotation_created',
      title: 'Quotation Created',
      message: `Quotation ${quotationNo} created successfully`,
      date: 'Just now',
      read: false
    });

    const fullQuot = await dbFetchQuotations(newQuotation.id);
    return NextResponse.json(formatQuotation(fullQuot));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    const {
      id,
      quotationNo,
      quotationDate,
      validUntil,
      clientId,
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
      status = 'PENDING',
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
    }
    if (!quotationNo || !quotationDate || !validUntil || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quotationPayload = {
      quotation_no: quotationNo,
      quotation_date: quotationDate,
      valid_until: validUntil,
      client_id: parseInt(clientId),
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
      gross_total: grossTotal,
      status
    };

    const formattedItems = items.map(item => ({
      sr: item.sr,
      desc: item.desc || item.description,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total,
      uom: item.uom || 'Nos',
      cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
      sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
    }));

    await dbUpdateQuotation(id, quotationPayload, formattedItems);

    // Add Notification
    await dbCreateNotification({
      type: 'quotation_updated',
      title: 'Quotation Updated',
      message: `Quotation ${quotationNo} updated successfully`,
      date: 'Just now',
      read: false
    });

    const fullQuot = await dbFetchQuotations(id);
    return NextResponse.json(formatQuotation(fullQuot));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
    }

    const quotation = await dbFetchQuotations(id);
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    await dbDeleteQuotation(id);

    // Add Notification
    await dbCreateNotification({
      type: 'quotation_deleted',
      title: 'Quotation Deleted',
      message: `Quotation ${quotation.quotation_no} deleted successfully`,
      date: 'Just now',
      read: false
    });

    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
