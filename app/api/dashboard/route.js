import { NextResponse } from 'next/server';
import { 
  dbFetchClients, 
  dbFetchInvoices, 
  dbFetchPayments, 
  dbFetchQuotations 
} from '@/lib/db_helper';

export async function GET() {
  try {
    // 1. Client count
    const clients = await dbFetchClients();
    const totalClients = clients.length;

    // 2. Invoices & Revenue calculations
    const invoices = await dbFetchInvoices();
    let totalRevenue = 0;
    let outstanding = 0;
    
    invoices.forEach(inv => {
      totalRevenue += inv.gross_total;
      outstanding += inv.remaining_amount;
    });

    // 3. Collections sum
    const payments = await dbFetchPayments();
    const paidInvoices = payments.reduce((sum, p) => sum + p.amount, 0);

    // 4. Recent activity log (Invoices & Quotations)
    const quotations = await dbFetchQuotations();

    const formattedInvoices = invoices.map(inv => ({
      type: 'invoice',
      id: inv.id,
      num: inv.invoice_no,
      total: inv.gross_total,
      date: inv.invoice_date,
      clientName: inv.clientName || (inv.clients ? inv.clients.name : 'Unknown Client')
    }));

    const formattedQuotations = quotations.map(quot => ({
      type: 'quotation',
      id: quot.id,
      num: quot.quotation_no,
      total: quot.gross_total,
      date: quot.quotation_date,
      clientName: quot.clientName || (quot.clients ? quot.clients.name : 'Unknown Client')
    }));

    const activity = [...formattedInvoices, ...formattedQuotations]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      paidInvoices,
      outstanding,
      totalClients,
      activity
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
