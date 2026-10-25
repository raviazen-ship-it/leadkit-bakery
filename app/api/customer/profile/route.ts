import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/auth';
import { updateCustomerProfile } from '@/lib/db/repository';

export async function PATCH(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    const updated = await updateCustomerProfile(session.customerId, { name, phone, address });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
