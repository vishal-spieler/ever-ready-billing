import { NextResponse } from 'next/server';
import { dbDeletePurchaseOrderFile } from '@/lib/db_helper';

export async function POST(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Purchase Order ID is required' }, { status: 400 });
    }

    await dbDeletePurchaseOrderFile(id);
    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
