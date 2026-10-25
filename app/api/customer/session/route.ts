import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/auth';
import { getCustomerById } from '@/lib/db/repository';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, customer: null }, { status: 401 });
    }

    const customer = await getCustomerById(session.customerId);
    if (!customer) {
      return NextResponse.json({ success: false, customer: null }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Session check failed.' }, { status: 500 });
  }
}
