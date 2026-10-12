import { adminContext, verifyPin, uploadPhotos, toFiles } from '@/lib/api-helpers';

/** PATCH /api/couple — đổi ảnh hero (field `photos`) hoặc ảnh bộ đếm (field `counter_photos`). */
export async function PATCH(req: Request) {
  const ctx = adminContext();
  if (!ctx) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const { admin, cid } = ctx;
  const form = await req.formData();
  const v = await verifyPin(admin, cid, String(form.get('pin') ?? ''));
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

  const update: { hero_photo_url?: string; counter_photo_url?: string } = {};
  const heroUrls = await uploadPhotos(admin, cid, 'hero', toFiles(form, 1, 'photos'));
  const counterUrls = await uploadPhotos(admin, cid, 'hero', toFiles(form, 1, 'counter_photos'));
  if (heroUrls[0]) update.hero_photo_url = heroUrls[0];
  if (counterUrls[0]) update.counter_photo_url = counterUrls[0];
  if (!Object.keys(update).length) return Response.json({ error: 'Chưa chọn ảnh.' }, { status: 400 });

  const { error } = await admin.from('couples').update(update).eq('id', cid);
  if (error) return Response.json({ error: 'Không lưu được.' }, { status: 500 });
  return Response.json({ ok: true, ...update });
}
