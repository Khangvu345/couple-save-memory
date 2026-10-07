import { createHash } from 'node:crypto';
import { getSupabaseAdmin, coupleId } from '@/lib/supabase';

/**
 * POST /api/wishes — thêm điều ước mới (kèm ảnh, không bắt buộc).
 * Phase 1: bảo vệ bằng mã PIN chung (hash SHA-256 so với couples.pin_hash),
 * ghi bằng service-role key phía server. Phase 3 sẽ thay bằng Supabase Auth + RLS.
 */
export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });

  const form = await req.formData();
  const pin = String(form.get('pin') ?? '');
  const text = String(form.get('text') ?? '').trim();
  const createdBy = String(form.get('createdBy') ?? '').slice(0, 50) || null;
  if (!text) return Response.json({ error: 'Thiếu nội dung điều ước.' }, { status: 400 });

  const cid = coupleId();
  const { data: couple } = await admin.from('couples').select('id,pin_hash').eq('id', cid).single();
  if (!couple?.pin_hash) return Response.json({ error: 'Chưa đặt mã PIN.' }, { status: 500 });

  const hash = createHash('sha256').update(pin).digest('hex');
  if (hash !== couple.pin_hash) return Response.json({ error: 'Sai mã PIN.' }, { status: 401 });

  // upload ảnh (tối đa 4 ảnh, mỗi ảnh < 8MB)
  const urls: string[] = [];
  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 4);
  for (const f of files) {
    if (f.size > 8 * 1024 * 1024) continue;
    const ext = (f.name.split('.').pop() ?? 'jpg').slice(0, 8);
    const path = `${cid}/wishes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await admin.storage.from('couple-photos').upload(path, f, { contentType: f.type });
    if (!error) urls.push(admin.storage.from('couple-photos').getPublicUrl(path).data.publicUrl);
  }

  const { error: insErr } = await admin.from('wishes').insert({
    couple_id: cid, text, photos: urls, created_by: createdBy,
  });
  if (insErr) return Response.json({ error: 'Không lưu được điều ước.' }, { status: 500 });
  return Response.json({ ok: true });
}
