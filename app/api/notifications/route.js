import { NextResponse } from 'next/server';
import { 
  dbFetchQuotations, 
  dbFetchNotifications, 
  dbCreateNotification, 
  dbUpdateNotification, 
  dbDeleteNotification 
} from '@/lib/db_helper';

export async function GET() {
  try {
    // Scan pending quotations and generate expiry notifications
    const pendingQuotations = await dbFetchQuotations();
    const activePending = pendingQuotations.filter(q => q.status === 'PENDING');

    const notifications = await dbFetchNotifications();

    if (activePending.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const quot of activePending) {
        if (!quot.valid_until) continue;

        const expiryDate = new Date(quot.valid_until);
        expiryDate.setHours(0, 0, 0, 0);

        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Expired
          const exists = notifications.some(
            n => n.type === 'quote_expired' && n.message.includes(quot.quotation_no)
          );

          if (!exists) {
            const newNotif = await dbCreateNotification({
              type: 'quote_expired',
              title: 'Quotation Expired',
              message: `Quotation ${quot.quotation_no} expired on ${quot.valid_until}`,
              date: 'Just now',
              read: false
            });
            notifications.unshift(newNotif);
          }
        } else if (diffDays <= 5) {
          // Expiring soon (0 to 5 days)
          const exists = notifications.some(
            n => n.type === 'quote_expiring' && n.message.includes(quot.quotation_no)
          );

          if (!exists) {
            const dayText = diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
            const newNotif = await dbCreateNotification({
              type: 'quote_expiring',
              title: 'Quote Expiring',
              message: `Quotation ${quot.quotation_no} expires ${dayText} (${quot.valid_until})`,
              date: 'Just now',
              read: false
            });
            notifications.unshift(newNotif);
          }
        }
      }
    }

    if (notifications.length === 0) {
      const defaultNotifications = [
        { type: 'payment_due', title: 'Payment Due', message: 'INV-001 is due on 04-07-2026', date: '2 hours ago', read: false },
        { type: 'quote_expiring', title: 'Quote Expiring', message: 'QUO-001 expires in 5 days', date: '5 hours ago', read: false }
      ];
      
      const seededList = [];
      for (const dn of defaultNotifications) {
        const seeded = await dbCreateNotification(dn);
        seededList.push(seeded);
      }
      return NextResponse.json(seededList);
    }

    // Standardize notifications format
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

    await dbUpdateNotification(id, { read: true });
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

    await dbDeleteNotification(id);
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
