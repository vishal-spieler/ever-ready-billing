import { NextResponse } from 'next/server';
import { dbFetchCredentials, dbUpdatePassword } from '@/lib/db_helper';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const credentials = await dbFetchCredentials();
    
    if (username === credentials.login_username && password === credentials.login_password) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const credentials = await dbFetchCredentials();
    
    if (currentPassword === credentials.login_password) {
      await dbUpdatePassword(newPassword);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
