import { adminContext, verifyPin, uploadPhotos, toFiles } from '@/lib/api-helpers';

/** POST /api/memories — thêm kỷ niệm (từ khu vực quản trị tạm thời) */
export async function POST(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const form = await req.formData();
  const v = await verifyPin(admin, cid, String(form.get('pin') ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

  const date = String(form.get('date') ?? '').slice(0, 10);
  if (!date) return Response.json({ error: 'Thiếu ngày.' }, { status: 400 });

  const urls = await uploadPhotos(admin, cid, 'memories', toFiles(form, 4));
  const { count } = await admin.from('memories').select('id', { count: 'exact', head: true }).eq('couple_id', cid);
  const rawEffect = String(form.get('text_effect') ?? 'fade');
  const textEffect = rawEffect === 'typewriter' ? 'typewriter' : 'fade';

  const { data: inserted, error } = await admin
    .from('memories')
    .insert({
      couple_id: cid,
      date,
      title: String(form.get('title') ?? '').slice(0, 120),
      teaser: String(form.get('teaser') ?? '').slice(0, 300),
      story: String(form.get('story') ?? ''),
      layout: String(form.get('layout') ?? 'standard'),
      photos: urls,
      handwritten_note: String(form.get('handwritten_note') ?? '').slice(0, 120) || null,
      text_effect: textEffect,
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (error) return Response.json({ error: 'Không lưu được.' }, { status: 500 });
  return Response.json({ ok: true, memory: inserted });
}

/** PATCH /api/memories — sửa kỷ niệm, hoặc đổi thứ tự (move: up|down) */
export async function PATCH(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const form = await req.formData();
  const id = String(form.get('id') ?? '');
  const v = await verifyPin(admin, cid, String(form.get('pin') ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
  if (!id) return Response.json({ error: 'Thiếu id.' }, { status: 400 });

  // đổi thứ tự: viết lại sort_order cho cả danh sách
  const move = String(form.get('move') ?? '');
  if (move === 'up' || move === 'down') {
    const { data: all } = await admin
      .from('memories')
      .select('id')
      .eq('couple_id', cid)
      .order('sort_order')
      .order('date')
      .order('created_at');
    const ids = (all ?? []).map((r) => r.id);
    const cur = ids.indexOf(id);
    if (cur < 0) return Response.json({ error: 'Không tìm thấy.' }, { status: 404 });
    const nxt = move === 'up' ? cur - 1 : cur + 1;
    if (nxt < 0 || nxt >= ids.length) return Response.json({ ok: true });
    ids.splice(nxt, 0, ids.splice(cur, 1)[0]);
    await Promise.all(ids.map((mid, i) => admin.from('memories').update({ sort_order: i }).eq('id', mid)));
    return Response.json({ ok: true });
  }

  const { data: existing } = await admin.from('memories').select('id,photos,couple_id').eq('id', id).single();
  if (!existing || existing.couple_id !== cid) {
    return Response.json({ error: 'Không tìm thấy.' }, { status: 404 });
  }

  let keptPhotos: string[] = [];
  try {
    keptPhotos = JSON.parse(String(form.get('keptPhotos') ?? '[]'));
  } catch {
    /* bỏ qua */
  }
  const urls = await uploadPhotos(admin, cid, 'memories', toFiles(form, 4));
  const existingPhotos: string[] = existing.photos ?? [];
  const photos = [...keptPhotos.filter((u) => existingPhotos.includes(u)), ...urls].slice(0, 4);
  const rawEffect = String(form.get('text_effect') ?? 'fade');
  const textEffect = rawEffect === 'typewriter' ? 'typewriter' : 'fade';

  const { data: updated, error } = await admin
    .from('memories')
    .update({
      date: String(form.get('date') ?? '').slice(0, 10),
      title: String(form.get('title') ?? '').slice(0, 120),
      teaser: String(form.get('teaser') ?? '').slice(0, 300),
      story: String(form.get('story') ?? ''),
      layout: String(form.get('layout') ?? 'standard'),
      photos,
      handwritten_note: String(form.get('handwritten_note') ?? '').slice(0, 120) || null,
      text_effect: textEffect,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) return Response.json({ error: 'Không lưu được.' }, { status: 500 });
  return Response.json({ ok: true, memory: updated });
}

/** DELETE /api/memories — xóa kỷ niệm */
export async function DELETE(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const { id, pin } = await req.json().catch(() => ({}));
  const v = await verifyPin(admin, cid, String(pin ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });
  if (!id) return Response.json({ error: 'Thiếu id.' }, { status: 400 });
  const { error } = await admin.from('memories').delete().eq('id', id).eq('couple_id', cid);
  if (error) return Response.json({ error: 'Không xóa được.' }, { status: 500 });
  return Response.json({ ok: true });
}
