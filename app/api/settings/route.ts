import { NextRequest, NextResponse } from 'next/server';
import { getBusinessSettings, updateBusinessSettings, getStorageMode } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getBusinessSettings();
    const mode = getStorageMode();
    return NextResponse.json({
      success: true,
      data: settings,
      meta: {
        storageMode: mode,
        supabaseConfigured: mode === 'supabase',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak. Sesi admin diperlukan.' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateBusinessSettings(body);
    return NextResponse.json({ success: true, data: updated, message: 'Pengaturan berhasil diperbarui.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
