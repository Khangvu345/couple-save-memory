import { adminContext, verifyPin } from '@/lib/api-helpers';

/** POST /api/pin — kiểm tra mã PIN (dùng để mở khóa khu vực quản trị). */
export async function POST(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { pin } = await req.json().catch(() => ({}));
  const v = await verifyPin(ctx.admin, ctx.cid, String(pin ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
  return Response.json({ ok: true });
}
