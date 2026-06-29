import { NextResponse } from 'next/server';
import { dbFetchPurchaseOrders, dbCreatePurchaseOrder, dbUpdatePurchaseOrder, dbDeletePurchaseOrder } from '@/lib/db_helper';

// Convert camelCase frontend state to snake_case DB fields
function transformPO(body) {
  const { items, ...rest } = body;

  const po = {
    po_no: rest.poNo || rest.po_no,
    po_date: rest.poDate || rest.po_date,
    valid_until: rest.validUntil || rest.valid_until,
    client_id: rest.clientId || rest.client_id,
    vendor_or_client: rest.vendor_or_client || 'CLIENT',
    tax_type: rest.taxType || rest.tax_type,
    cgst_rate: rest.cgstRate ?? rest.cgst_rate ?? 9,
    sgst_rate: rest.sgstRate ?? rest.sgst_rate ?? 9,
    igst_rate: rest.igstRate ?? rest.igst_rate ?? 18,
    subtotal: rest.subtotal ?? 0,
    discount: rest.discount ?? 0,
    transport_charges: rest.transportCharges ?? rest.transport_charges ?? 0,
    cgst_amount: rest.cgstAmount ?? rest.cgst_amount ?? 0,
    sgst_amount: rest.sgstAmount ?? rest.sgst_amount ?? 0,
    igst_amount: rest.igstAmount ?? rest.igst_amount ?? 0,
    gross_total: rest.grossTotal ?? rest.gross_total ?? 0,
  };

  const transformedItems = (items || []).map((item, idx) => ({
    sr: item.sr ?? idx + 1,
    desc: item.desc || item.description || '',
    hsn: item.hsn || '',
    qty: item.qty ?? 0,
    rate: item.rate ?? 0,
    total: item.total ?? 0,
    uom: item.uom || 'Nos',
    cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
    sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
  }));

  return { po, items: transformedItems };
}

function formatPO(po) {
  if (!po) return null;
  const formattedItems = (po.items || []).map(item => ({
    ...item,
    poId: item.purchase_order_id,
    purchase_order_id: item.purchase_order_id,
    uom: item.uom || 'Nos',
    cgstRate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
    cgst_rate: item.cgstRate !== undefined ? item.cgstRate : (item.cgst_rate !== undefined ? item.cgst_rate : 9),
    sgstRate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9),
    sgst_rate: item.sgstRate !== undefined ? item.sgstRate : (item.sgst_rate !== undefined ? item.sgst_rate : 9)
  }));
  const clientInfo = po.clients || {};

  return {
    ...po,
    poNo: po.po_no,
    po_no: po.po_no,
    poDate: po.po_date,
    po_date: po.po_date,
    validUntil: po.valid_until,
    valid_until: po.valid_until,
    clientId: po.client_id,
    client_id: po.client_id,
    taxType: po.tax_type,
    tax_type: po.tax_type,
    cgstRate: po.cgst_rate,
    cgst_rate: po.cgst_rate,
    sgstRate: po.sgst_rate,
    sgst_rate: po.sgst_rate,
    igstRate: po.igst_rate,
    igst_rate: po.igst_rate,
    cgstAmount: po.cgst_amount,
    cgst_amount: po.cgst_amount,
    sgstAmount: po.sgst_amount,
    sgst_amount: po.sgst_amount,
    igstAmount: po.igst_amount,
    igst_amount: po.igst_amount,
    grossTotal: po.gross_total,
    gross_total: po.gross_total,
    discount: po.discount || 0,
    transportCharges: po.transport_charges || 0,
    transport_charges: po.transport_charges || 0,
    
    // Flatten client details
    clientName: po.clientName || clientInfo.name,
    
    items: formattedItems
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const po = await dbFetchPurchaseOrders(id);
      if (!po) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(formatPO(po));
    }

    const pos = await dbFetchPurchaseOrders();
    return NextResponse.json((pos || []).map(formatPO));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { po, items } = transformPO(body);

    const newPO = await dbCreatePurchaseOrder(po, items);
    const fullPO = await dbFetchPurchaseOrders(newPO.id);
    return NextResponse.json(formatPO(fullPO));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { po, items } = transformPO(body);

    await dbUpdatePurchaseOrder(id, po, items);
    const updatedPO = await dbFetchPurchaseOrders(id);
    return NextResponse.json(formatPO(updatedPO));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await dbDeletePurchaseOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
