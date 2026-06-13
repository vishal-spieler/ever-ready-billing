import { NextResponse } from 'next/server';
import { dbFetchComments, dbCreateComment } from '@/lib/db_helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const comments = await dbFetchComments(parseInt(invoiceId));
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { invoiceId, comment, commentType = 'NOTE' } = data;

    if (!invoiceId || !comment) {
      return NextResponse.json({ error: 'Invoice ID and comment text are required' }, { status: 400 });
    }

    const commentPayload = {
      invoice_id: parseInt(invoiceId),
      comment,
      comment_type: commentType
    };

    const newComment = await dbCreateComment(commentPayload);
    return NextResponse.json(newComment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
