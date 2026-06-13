import { NextResponse } from 'next/server';
import { 
  dbFetchPayments, 
  dbCreatePayment, 
  dbFetchInvoices, 
  dbCreateComment,
  dbCreateNotification 
} from '@/lib/db_helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    
    const payments = await dbFetchPayments(invoiceId ? parseInt(invoiceId) : null);
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { invoiceId, paymentDate, amount, paymentMode, referenceNumber, notes } = data;

    if (!invoiceId || !paymentDate || !amount || !paymentMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const validModes = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER'];
    if (!validModes.includes(paymentMode)) {
      return NextResponse.json({ error: 'Invalid payment mode' }, { status: 400 });
    }

    // Validate invoice existence
    const invoice = await dbFetchInvoices(invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const paymentPayload = {
      invoice_id: parseInt(invoiceId),
      payment_date: paymentDate,
      amount: numericAmount,
      payment_mode: paymentMode,
      reference_number: referenceNumber || null,
      notes: notes || null
    };

    const newPayment = await dbCreatePayment(paymentPayload);

    // Create SYSTEM comment
    const modeLabels = {
      CASH: 'Cash',
      UPI: 'UPI',
      BANK_TRANSFER: 'Bank Transfer',
      CHEQUE: 'Cheque',
      CARD: 'Card',
      OTHER: 'Other'
    };
    const refText = referenceNumber ? ` (Ref: ${referenceNumber})` : '';
    await dbCreateComment({
      invoice_id: invoiceId,
      comment: `Payment of ₹${numericAmount.toFixed(2)} received via ${modeLabels[paymentMode]}${refText}`,
      comment_type: 'SYSTEM'
    });

    // Create Notification
    await dbCreateNotification({
      type: 'payment_added',
      title: 'Payment Received',
      message: `Received ₹${numericAmount.toFixed(2)} for Invoice ${invoice.invoice_no}`,
      date: 'Just now',
      read: false
    });

    return NextResponse.json(newPayment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
