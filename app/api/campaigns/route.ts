import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns, getActiveCampaign, upsertCampaign } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (activeOnly) {
      const active = await getActiveCampaign();
      return NextResponse.json({ success: true, data: active });
    }

    const campaigns = await getCampaigns();
    return NextResponse.json({ success: true, data: campaigns });
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
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Judul campaign wajib diisi.' }, { status: 400 });
    }

    const saved = await upsertCampaign(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
