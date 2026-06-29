import { NextResponse } from 'next/server';
import { dbUpdateInvoicePO } from '@/lib/db_helper';

export async function POST(request) {
  try {
    const { id, fileName, fileType, fileData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    if (!fileData) {
      return NextResponse.json({ error: 'File data is required' }, { status: 400 });
    }

    await dbUpdateInvoicePO(id, fileName, fileType, fileData);
    return NextResponse.json({ success: true, message: 'PO uploaded successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
