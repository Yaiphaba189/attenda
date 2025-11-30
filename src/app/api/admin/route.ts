import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [statsRes, notificationsRes] = await Promise.all([
      fetch('http://localhost:3001/api/admin/stats'),
      fetch('http://localhost:3001/api/admin/notifications')
    ]);

    if (!statsRes.ok || !notificationsRes.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const stats = await statsRes.json();
    const notifications = await notificationsRes.json();

    return NextResponse.json({
      stats,
      notifications
    });
  } catch (error) {
    console.error('Error in admin API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
