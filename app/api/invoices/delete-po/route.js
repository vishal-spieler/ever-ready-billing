import { NextResponse } from 'next/server';
import { dbDeleteInvoicePO } from '@/lib/db_helper';

export async function POST(request) {
  try {
    const { id } = await request.json();
    console.log('[API DELETE PO] Received invoice ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const result = await dbDeleteInvoicePO(id);
    console.log('[API DELETE PO] Database update result:', result);
    return NextResponse.json({ success: true, message: 'PO deleted successfully' });
  } catch (error) {
    console.error('[API DELETE PO] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
