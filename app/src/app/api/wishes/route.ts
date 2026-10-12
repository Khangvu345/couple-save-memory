import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, coupleId } from '@/lib/supabase';

async function verifyPin(admin: SupabaseClient, cid: string, pin: string) {
  const { data: couple } = await admin.from('couples').select('id,pin_hash').eq('id', cid).single();
  if (!couple?.pin_hash) return { ok: false as const, error: 'Chưa đặt mã PIN.', status: 500 };
  const hash = createHash('sha256').update(pin).digest('hex');
  if (hash !== couple.pin_hash) return { ok: false as const, error: 'Sai mã PIN.', status: 401 };
  return { ok: true as const };
}

async function uploadPhotos(admin: SupabaseClient, cid: string, files: File[]): Promise<string[]> {
  const uploaded = await Promise.all(files.map(async (f) => {
    if (f.size > 8 * 1024 * 1024) return null;
    const ext = (f.name.split('.').pop() ?? 'jpg').slice(0, 8);
    const path = `${cid}/wishes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await admin.storage.from('couple-photos').upload(path, f, { contentType: f.type });
    if (error) return null;
    return admin.storage.from('couple-photos').getPublicUrl(path).data.publicUrl;
  }));
  return uploaded.filter((u): u is string => !!u);
}

const toFiles = (form: FormData) =>
  form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);

/** POST — thêm điều ước mới */
export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const form = await req.formData();
  const pin = String(form.get('pin') ?? '');
  const text = String(form.get('text') ?? '').trim();
  const createdBy = String(form.get('createdBy') ?? '').slice(0, 50) || null;
  if (!text) return Response.json({ error: 'Thiếu nội dung điều ước.' }, { status: 400 });

  const cid = coupleId();
  const v = await verifyPin(admin, cid, pin);
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

  const urls = await uploadPhotos(admin, cid, toFiles(form));
  const { data: inserted, error: insErr } = await admin.from('wishes').insert({
  couple_id: cid, text, photos: urls, created_by: createdBy,
  }).select().single();
  if (insErr) return Response.json({ error: 'Không lưu được điều ước.' }, { status: 500 });
  return Response.json({ ok: true, wish: inserted });
  
}

/** PATCH — sửa điều ước (chữ + ảnh: giữ/xóa/thêm) */
export async function PATCH(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'Chưa cấu hình Supabase.' }, { status: 500 });
  const form = await req.formData();
  const id = String(form.get('id') ?? '');
  const pin = String(form.get('pin') ?? '');
  const text = String(form.get('text') ?? '').trim();
  let keptPhotos: string[] = [];
  try { keptPhotos = JSON.parse(String(form.get('keptPhotos') ?? '[]')); } catch { /* bỏ qua */ }
  if (!id) return Response.json({ error: 'Thiếu id.' }, { status: 400 });
  if (!text) return Response.json({ error: 'Thiếu nội dung điều ước.' }, { status: 400 });

  const cid = coupleId();
  const v = await verifyPin(admin, cid, pin);
  if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

  const { data: existing } = await admin.from('wishes').select('id,photos,couple_id').eq('id', id).single();
  if (!existing || existing.couple_id !== cid) {
    return Response.json({ error: 'Không tìm thấy điều ước.' }, { status: 404 });
  }

  const urls = await uploadPhotos(admin, cid, toFiles(form));
  const existingPhotos: string[] = existing.photos ?? [];
  // chỉ giữ những URL vốn thuộc về wish này + ảnh mới, tối đa 3
  const photos = [...keptPhotos.filter((u) => existingPhotos.includes(u)), ...urls].slice(0, 3);

  const { data: updated, error: upErr } = await admin.from('wishes').update({ text, photos }).eq('id', id).select().single();
  if (upErr) return Response.json({ error: 'Không lưu được.' }, { status: 500 });
  return Response.json({ ok: true, wish: updated });
}
  