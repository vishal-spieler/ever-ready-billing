import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(clients || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Standardize input property names to handle both frontend styles
    const name = data.name;
    const contact_person = data.contact_person || data.contact;
    const mobile = data.mobile;
    const email = data.email;
    const address = data.address || data.addr;
    const city = data.city;
    const state = data.state;
    const pin = data.pin;
    const gstin = data.gstin;
    const pan = data.pan;

    if (!name || !mobile || !address || !city || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([
        {
          name,
          contact_person,
          mobile,
          email,
          address,
          city,
          state,
          pin,
          gstin,
          pan
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newClient);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    const id = data.id;
    const name = data.name;
    const contact_person = data.contact_person || data.contact;
    const mobile = data.mobile;
    const email = data.email;
    const address = data.address || data.addr;
    const city = data.city;
    const state = data.state;
    const pin = data.pin;
    const gstin = data.gstin;
    const pan = data.pan;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    if (!name || !mobile || !address || !city || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update({
        name,
        contact_person,
        mobile,
        email,
        address,
        city,
        state,
        pin,
        gstin,
        pan
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updatedClient);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Check if client has existing invoices or quotations
    const { count: invoiceCount, error: invError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', id);

    if (invError) throw invError;

    const { count: quotationCount, error: quotError } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', id);

    if (quotError) throw quotError;

    if ((invoiceCount || 0) > 0 || (quotationCount || 0) > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete client. Client is referenced in existing invoices or quotations.' 
      }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
