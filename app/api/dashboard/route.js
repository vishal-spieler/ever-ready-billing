import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Client count
    const { count: totalClients, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (clientsError) throw clientsError;

    // 2. Invoice revenue calculations
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('gross_total');

    if (invoicesError) throw invoicesError;

    const totalRevenue = invoices ? invoices.reduce((sum, inv) => sum + inv.gross_total, 0) : 0;
    
    // For outstanding & paid, we will calculate based on simulated ratio as per SQLite code
    const paidInvoices = totalRevenue * 0.7;
    const outstanding = totalRevenue * 0.3;

    // 3. Recent activity list (invoices and quotations)
    const { data: recentInvoices, error: recentInvoicesError } = await supabase
      .from('invoices')
      .select('id, invoice_no, gross_total, invoice_date, clients(name)')
      .order('id', { ascending: false })
      .limit(5);

    if (recentInvoicesError) throw recentInvoicesError;

    const { data: recentQuotations, error: recentQuotationsError } = await supabase
      .from('quotations')
      .select('id, quotation_no, gross_total, quotation_date, clients(name)')
      .order('id', { ascending: false })
      .limit(5);

    if (recentQuotationsError) throw recentQuotationsError;

    const formattedInvoices = (recentInvoices || []).map(inv => ({
      type: 'invoice',
      id: inv.id,
      num: inv.invoice_no,
      total: inv.gross_total,
      date: inv.invoice_date,
      clientName: inv.clients ? inv.clients.name : 'Unknown Client'
    }));

    const formattedQuotations = (recentQuotations || []).map(quot => ({
      type: 'quotation',
      id: quot.id,
      num: quot.quotation_no,
      total: quot.gross_total,
      date: quot.quotation_date,
      clientName: quot.clients ? quot.clients.name : 'Unknown Client'
    }));

    const activity = [...formattedInvoices, ...formattedQuotations]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      paidInvoices,
      outstanding,
      totalClients: totalClients || 0,
      activity
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
