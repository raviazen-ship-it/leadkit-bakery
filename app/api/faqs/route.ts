import { NextRequest, NextResponse } from 'next/server';
import { getFAQs, upsertFAQ, deleteFAQ } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const faqs = await getFAQs(category);
    return NextResponse.json({ success: true, data: faqs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.question?.trim() || !body.answer?.trim()) {
      return NextResponse.json({ error: 'Pertanyaan dan jawaban wajib diisi.' }, { status: 400 });
    }

    const saved = await upsertFAQ(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID FAQ wajib disertakan.' }, { status: 400 });
    }

    await deleteFAQ(id);
    return NextResponse.json({ success: true, message: 'FAQ berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
