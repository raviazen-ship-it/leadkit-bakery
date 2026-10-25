import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/auth';
import { getCustomerById, getCustomerOrders } from '@/lib/db/repository';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await getCustomerById(session.customerId);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const orders = await getCustomerOrders(customer.id, customer.phone);
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error('Fetch customer orders error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve customer orders' }, { status: 500 });
  }
}
