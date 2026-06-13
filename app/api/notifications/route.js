import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Scan pending quotations and generate expiry notifications
    const { data: pendingQuotations } = await supabase
      .from('quotations')
      .select('id, quotation_no, valid_until')
      .eq('status', 'PENDING');

    if (pendingQuotations && pendingQuotations.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const quot of pendingQuotations) {
        if (!quot.valid_until) continue;

        const expiryDate = new Date(quot.valid_until);
        expiryDate.setHours(0, 0, 0, 0);

        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Expired
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .like('message', `%${quot.quotation_no}%`)
            .eq('type', 'quote_expired');

          if (!existing || existing.length === 0) {
            await supabase.from('notifications').insert([
              {
                type: 'quote_expired',
                title: 'Quotation Expired',
                message: `Quotation ${quot.quotation_no} expired on ${quot.valid_until}`,
                date: 'Just now',
                read: false
              }
            ]);
          }
        } else if (diffDays <= 5) {
          // Expiring soon (0 to 5 days)
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .like('message', `%${quot.quotation_no}%`)
            .eq('type', 'quote_expiring');

          if (!existing || existing.length === 0) {
            const dayText = diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
            await supabase.from('notifications').insert([
              {
                type: 'quote_expiring',
                title: 'Quote Expiring',
                message: `Quotation ${quot.quotation_no} expires ${dayText} (${quot.valid_until})`,
                date: 'Just now',
                read: false
              }
            ]);
          }
        }
      }
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    if (!notifications || notifications.length === 0) {
      const defaultNotifications = [
        { type: 'payment_due', title: 'Payment Due', message: 'INV-001 is due on 04-07-2026', date: '2 hours ago', read: false },
        { type: 'quote_expiring', title: 'Quote Expiring', message: 'QUO-001 expires in 5 days', date: '5 hours ago', read: false }
      ];
      
      const { data: seeded, error: seedError } = await supabase
        .from('notifications')
        .insert(defaultNotifications)
        .select();
      
      if (seedError) {
        return NextResponse.json(defaultNotifications);
      }
      return NextResponse.json(seeded || defaultNotifications);
    }

    // Convert boolean read to expected output
    const formatted = notifications.map((n) => ({
      ...n,
      read: n.read === true || n.read === 1,
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
