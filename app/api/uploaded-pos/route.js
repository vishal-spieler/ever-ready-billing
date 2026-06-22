import { NextResponse } from 'next/server';
import { dbFetchUploadedPOs, dbCreateUploadedPO, dbDeleteUploadedPO } from '@/lib/db_helper';

// Convert camelCase frontend state to snake_case DB fields
function transformUploadedPO(body) {
  return {
    client_id: body.clientId || body.client_id,
    vendor_or_client: body.vendor_or_client || 'CLIENT',
    file_name: body.fileName || body.file_name || '',
    file_type: body.fileType || body.file_type || '',
    file_data: body.fileData || body.file_data || '',
    upload_date: body.upload_date || new Date().toISOString().split('T')[0],
    notes: body.notes || null,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    const pos = await dbFetchUploadedPOs(clientId);
    return NextResponse.json(pos);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = transformUploadedPO(body);

    if (!data.client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }
    if (!data.file_data) {
      return NextResponse.json({ error: 'file_data is required' }, { status: 400 });
    }

    const newPO = await dbCreateUploadedPO(data);
    return NextResponse.json(newPO);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await dbDeleteUploadedPO(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
