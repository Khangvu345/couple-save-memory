import { adminContext, verifyPin, uploadPhotos, toFiles } from '@/lib/api-helpers';

/** POST /api/little-things — thêm điều nhỏ (từ khu vực quản trị tạm thời) */
export async function POST(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const form = await req.formData();
  const v = await verifyPin(admin, cid, String(form.get('pin') ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

  const text = String(form.get('text') ?? '').trim();
  if (!text) return Response.json({ error: 'Thiếu nội dung.' }, { status: 400 });

  const urls = await uploadPhotos(admin, cid, 'things', toFiles(form, 1));
  const { count } = await admin.from('little_things').select('id', { count: 'exact', head: true }).eq('couple_id', cid);

  const { data: inserted, error } = await admin
    .from('little_things')
    .insert({
      couple_id: cid,
      text,
      handwritten_note: String(form.get('handwritten_note') ?? '').slice(0, 100) || null,
      photo_url: urls[0] ?? null,
      rotation: Number(form.get('rotation') ?? 0) || 0,
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (error) return Response.json({ error: 'Không lưu được.' }, { status: 500 });
  return Response.json({ ok: true, thing: inserted });
}

/** PATCH /api/little-things — sửa điều nhỏ, hoặc đổi thứ tự (move: up|down) */
export async function PATCH(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const form = await req.formData();
  const id = String(form.get('id') ?? '');
  const v = await verifyPin(admin, cid, String(form.get('pin') ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
  if (!id) return Response.json({ error: 'Thiếu id.' }, { status: 400 });

  const move = String(form.get('move') ?? '');
  if (move === 'up' || move === 'down') {
    const { data: all } = await admin
      .from('little_things')
      .select('id')
      .eq('couple_id', cid)
      .order('sort_order')
      .order('created_at');
    const ids = (all ?? []).map((r) => r.id);
    const cur = ids.indexOf(id);
    if (cur < 0) return Response.json({ error: 'Không tìm thấy.' }, { status: 404 });
    const nxt = move === 'up' ? cur - 1 : cur + 1;
    if (nxt < 0 || nxt >= ids.length) return Response.json({ ok: true });
    ids.splice(nxt, 0, ids.splice(cur, 1)[0]);
    await Promise.all(ids.map((mid, i) => admin.from('little_things').update({ sort_order: i }).eq('id', mid)));
    return Response.json({ ok: true });
  }

  const { data: existing } = await admin.from('little_things').select('id,photo_url,couple_id').eq('id', id).single();
  if (!existing || existing.couple_id !== cid) {
    return Response.json({ error: 'Không tìm thấy.' }, { status: 404 });
  }

  const urls = await uploadPhotos(admin, cid, 'things', toFiles(form, 1));
  const keptPhoto = String(form.get('keptPhoto') ?? '');
  // ảnh mới (nếu có) ưu tiên; không thì giữ ảnh cũ nếu client còn giữ; còn lại = null
  const photo_url = urls[0] ?? (keptPhoto && keptPhoto === existing.photo_url ? keptPhoto : null);

  const { data: updated, error } = await admin
    .from('little_things')
    .update({
      text: String(form.get('text') ?? '').trim(),
      handwritten_note: String(form.get('handwritten_note') ?? '').slice(0, 100) || null,
      photo_url,
      rotation: Number(form.get('rotation') ?? 0) || 0,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) return Response.json({ error: 'Không lưu được.' }, { status: 500 });
  return Response.json({ ok: true, thing: updated });
}

/** DELETE /api/little-things — xóa điều nhỏ */
export async function DELETE(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const { id, pin } = await req.json().catch(() => ({}));
  const v = await verifyPin(admin, cid, String(pin ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
  if (!id) return Response.json({ error: 'Thiếu id.' }, { status: 400 });
  const { error } = await admin.from('little_things').delete().eq('id', id).eq('couple_id', cid);
  if (error) return Response.json({ error: 'Không xóa được.' }, { status: 500 });
  return Response.json({ ok: true });
}
