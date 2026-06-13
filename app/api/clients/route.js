import { NextResponse } from 'next/server';
import { 
  dbFetchClients, 
  dbCreateClient, 
  dbUpdateClient, 
  dbDeleteClient,
  dbFetchInvoices,
  dbFetchQuotations
} from '@/lib/db_helper';

export async function GET() {
  try {
    const clients = await dbFetchClients();
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

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

    const payload = {
      name,
      contact_person: contact_person || null,
      mobile,
      email: email || null,
      address,
      city,
      state: state || null,
      pin,
      gstin: gstin || null,
      pan: pan || null
    };

    const newClient = await dbCreateClient(payload);
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

    const payload = {
      name,
      contact_person: contact_person || null,
      mobile,
      email: email || null,
      address,
      city,
      state: state || null,
      pin,
      gstin: gstin || null,
      pan: pan || null
    };

    const updatedClient = await dbUpdateClient(id, payload);
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
    const invoices = await dbFetchInvoices();
    const invoiceCount = invoices.filter(inv => inv.client_id == id).length;

    const quotations = await dbFetchQuotations();
    const quotationCount = quotations.filter(q => q.client_id == id).length;

    if (invoiceCount > 0 || quotationCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete client. Client is referenced in existing invoices or quotations.' 
      }, { status: 400 });
    }

    await dbDeleteClient(id);
    return NextResponse.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
