import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function formatQuotationItem(item) {
  if (!item) return {};
  return {
    ...item,
    quotationId: item.quotation_id,
    quotation_id: item.quotation_id,
  };
}

function formatQuotation(quotation, items = []) {
  if (!quotation) return {};
  const formattedItems = items.map(formatQuotationItem);
  
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
      // Fetch specific quotation with its items
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .select('*, clients(*)')
        .eq('id', id)
        .maybeSingle();

      if (quotationError) throw quotationError;
      if (!quotation) {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
      }

      const { data: items, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', id)
        .order('sr', { ascending: true });

      if (itemsError) throw itemsError;

      return NextResponse.json(formatQuotation(quotation, items || []));
    } else {
      // Fetch list of all quotations
      const { data: quotations, error: quotationsError } = await supabase
        .from('quotations')
        .select('*, clients(name)')
        .order('id', { ascending: false });

      if (quotationsError) throw quotationsError;

      const formattedQuotations = [];
      for (const quot of (quotations || [])) {
        const { data: items, error: itemsError } = await supabase
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', quot.id)
          .order('sr', { ascending: true });

        if (itemsError) throw itemsError;

        formattedQuotations.push(formatQuotation(quot, items || []));
      }
      
      return NextResponse.json(formattedQuotations);
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
      status = 'PENDING',
    } = data;

    if (!quotationNo || !quotationDate || !validUntil || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert Parent Quotation
    const { data: newQuotation, error: quotationError } = await supabase
      .from('quotations')
      .insert([
        {
          quotation_no: quotationNo,
          quotation_date: quotationDate,
          valid_until: validUntil,
          client_id: clientId,
          tax_type: taxType,
          cgst_rate: cgstRate !== undefined ? cgstRate : 9,
          sgst_rate: sgstRate !== undefined ? sgstRate : 9,
          igst_rate: igstRate !== undefined ? igstRate : 18,
          subtotal,
          cgst_amount: cgstAmount !== undefined ? cgstAmount : 0,
          sgst_amount: sgstAmount !== undefined ? sgstAmount : 0,
          igst_amount: igstAmount !== undefined ? igstAmount : 0,
          gross_total: grossTotal,
          status
        }
      ])
      .select()
      .single();

    if (quotationError) throw quotationError;

    // Insert Items
    const itemsToInsert = items.map(item => ({
      quotation_id: newQuotation.id,
      sr: item.sr,
      desc: item.desc,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      // Manual rollback
      await supabase.from('quotations').delete().eq('id', newQuotation.id);
      throw itemsError;
    }

    // Add Notification
    await supabase.from('notifications').insert([
      {
        type: 'quotation_created',
        title: 'Quotation Created',
        message: `Quotation ${quotationNo} created successfully`,
        date: 'Just now',
        read: false
      }
    ]);

    return NextResponse.json(formatQuotation(newQuotation, newItems || []));
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
      status = 'PENDING',
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
    }
    if (!quotationNo || !quotationDate || !validUntil || !clientId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update Parent Quotation
    const { data: updatedQuotation, error: quotationError } = await supabase
      .from('quotations')
      .update({
        quotation_no: quotationNo,
        quotation_date: quotationDate,
        valid_until: validUntil,
        client_id: clientId,
        tax_type: taxType,
        cgst_rate: cgstRate !== undefined ? cgstRate : 9,
        sgst_rate: sgstRate !== undefined ? sgstRate : 9,
        igst_rate: igstRate !== undefined ? igstRate : 18,
        subtotal,
        cgst_amount: cgstAmount !== undefined ? cgstAmount : 0,
        sgst_amount: sgstAmount !== undefined ? sgstAmount : 0,
        igst_amount: igstAmount !== undefined ? igstAmount : 0,
        gross_total: grossTotal,
        status
      })
      .eq('id', id)
      .select()
      .single();

    if (quotationError) throw quotationError;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', id);

    if (deleteError) throw deleteError;

    // Insert New Items
    const itemsToInsert = items.map(item => ({
      quotation_id: id,
      sr: item.sr,
      desc: item.desc || item.description,
      hsn: item.hsn || null,
      qty: item.qty,
      rate: item.rate,
      total: item.total
    }));

    const { data: newItems, error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) throw itemsError;

    // Add Notification
    await supabase.from('notifications').insert([
      {
        type: 'quotation_updated',
        title: 'Quotation Updated',
        message: `Quotation ${quotationNo} updated successfully`,
        date: 'Just now',
        read: false
      }
    ]);

    return NextResponse.json(formatQuotation(updatedQuotation, newItems || []));
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

    // Fetch quotation details for notifications
    const { data: quotation, error: fetchError } = await supabase
      .from('quotations')
      .select('quotation_no')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Delete quotation items manually first
    const { error: deleteItemsError } = await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', id);

    if (deleteItemsError) throw deleteItemsError;

    const { error: deleteQuotationError } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (deleteQuotationError) throw deleteQuotationError;
    
    // Add Notification
    await supabase.from('notifications').insert([
      {
        type: 'quotation_deleted',
        title: 'Quotation Deleted',
        message: `Quotation ${quotation.quotation_no} deleted successfully`,
        date: 'Just now',
        read: false
      }
    ]);

    return NextResponse.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
