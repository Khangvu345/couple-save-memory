import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin, coupleId } from './supabase';

/** Helper dùng chung cho các API quản trị (memories, little-things, pin). */

export function adminContext() {
  const admin = getSupabaseAdmin();
  const cid = coupleId();
  if (!admin || !cid) return null;
  return { admin, cid };
}

export async function verifyPin(admin: SupabaseClient, cid: string, pin: string) {
  const { data: couple } = await admin.from('couples').select('id,pin_hash').eq('id', cid).single();
  if (!couple?.pin_hash) return { ok: false as const, error: 'Chưa đặt mã PIN.', status: 500 };
  const hash = createHash('sha256').update(pin).digest('hex');
  if (hash !== couple.pin_hash) return { ok: false as const, error: 'Sai mã PIN.', status: 401 };
  return { ok: true as const };
}

export async function uploadPhotos(
  admin: SupabaseClient,
  cid: string,
  folder: 'memories' | 'things' | 'wishes' | 'hero',
  files: File[],
): Promise<string[]> {
  const uploaded = await Promise.all(
    files.map(async (f) => {
      if (f.size > 8 * 1024 * 1024) return null;
      const ext = (f.name.split('.').pop() ?? 'jpg').slice(0, 8);
      const path = `${cid}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await admin.storage.from('couple-photos').upload(path, f, { contentType: f.type });
      if (error) return null;
      return admin.storage.from('couple-photos').getPublicUrl(path).data.publicUrl;
    }),
  );
  return uploaded.filter((u): u is string => !!u);
}

/** Lấy danh sách File ảnh từ FormData, giới hạn số lượng. */
export const toFiles = (form: FormData, max: number, key = 'photos') =>
  form
    .getAll(key)
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, max);
