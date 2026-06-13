import { NextResponse } from 'next/server';
import { 
  dbFetchPaymentById,
  dbUpdatePayment,
  dbDeletePayment,
  dbFetchInvoices,
  dbCreateComment,
  dbCreateNotification 
} from '@/lib/db_helper';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid Payment ID' }, { status: 400 });
    }

    const data = await request.json();
    const { paymentDate, amount, paymentMode, referenceNumber, notes } = data;

    const oldPayment = await dbFetchPaymentById(paymentId);
    if (!oldPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (!paymentDate || !amount || !paymentMode) {
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

    const invoice = await dbFetchInvoices(oldPayment.invoice_id);

    const paymentPayload = {
      payment_date: paymentDate,
      amount: numericAmount,
      payment_mode: paymentMode,
      reference_number: referenceNumber || null,
      notes: notes || null
    };

    const updatedPayment = await dbUpdatePayment(paymentId, paymentPayload);

    // Create SYSTEM Comment
    const oldAmountStr = oldPayment.amount.toFixed(2);
    const newAmountStr = numericAmount.toFixed(2);
    let comment = `Payment of ₹${oldAmountStr} updated to ₹${newAmountStr}`;
    if (oldPayment.payment_mode !== paymentMode) {
      comment += ` and mode changed from ${oldPayment.payment_mode} to ${paymentMode}`;
    }
    await dbCreateComment({
      invoice_id: oldPayment.invoice_id,
      comment,
      comment_type: 'SYSTEM'
    });

    // Create Notification
    await dbCreateNotification({
      type: 'payment_updated',
      title: 'Payment Updated',
      message: `Updated payment for Invoice ${invoice ? invoice.invoice_no : 'unknown'}`,
      date: 'Just now',
      read: false
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid Payment ID' }, { status: 400 });
    }

    const oldPayment = await dbFetchPaymentById(paymentId);
    if (!oldPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const invoice = await dbFetchInvoices(oldPayment.invoice_id);

    await dbDeletePayment(paymentId);

    // Create SYSTEM Comment
    await dbCreateComment({
      invoice_id: oldPayment.invoice_id,
      comment: `Payment of ₹${oldPayment.amount.toFixed(2)} received on ${oldPayment.payment_date} was deleted`,
      comment_type: 'SYSTEM'
    });

    // Create Notification
    await dbCreateNotification({
      type: 'payment_deleted',
      title: 'Payment Deleted',
      message: `Deleted payment of ₹${oldPayment.amount.toFixed(2)} from Invoice ${invoice ? invoice.invoice_no : 'unknown'}`,
      date: 'Just now',
      read: false
    });

    return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
