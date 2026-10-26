import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/dbStore';
import { connectDB } from '@/lib/db';
import { Notification } from '@/lib/models/schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'All';

  const isConnected = await connectDB();
  if (isConnected) {
    try {
      const filter: any = role === 'All' ? {} : { $or: [{ recipientRole: role }, { recipientRole: 'All' }] };
      const mongoNotifs = await Notification.find(filter).sort({ createdAt: -1 });
      if (mongoNotifs && mongoNotifs.length > 0) {
        return NextResponse.json({ success: true, notifications: mongoNotifs });
      }
    } catch (err) {
      console.error('Error querying MongoDB notifications:', err);
    }
  }

  const notifications = dbStore.getNotifications(role);
  return NextResponse.json({ success: true, notifications });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, message: 'Missing notification id' }, { status: 400 });

    const isConnected = await connectDB();
    if (isConnected) {
      try {
        await Notification.updateOne({ _id: id }, { $set: { isRead: true } });
      } catch (err) {
        console.error('Error marking read in MongoDB:', err);
      }
    }

    dbStore.markNotificationRead(id);
    return NextResponse.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Patch error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Missing notification id' }, { status: 400 });

    const isConnected = await connectDB();
    if (isConnected) {
      try {
        await Notification.deleteOne({ _id: id });
      } catch (err) {
        console.error('Error deleting MongoDB notification:', err);
      }
    }

    dbStore.deleteNotification(id);
    return NextResponse.json({ success: true, message: 'Notification deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Delete error' }, { status: 500 });
  }
}
