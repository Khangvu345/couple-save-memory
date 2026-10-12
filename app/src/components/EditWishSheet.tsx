'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Wish } from '@/lib/types';

const MAX_PHOTOS = 3;

async function compressImage(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const maxDim = 1600;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.82));
}

const xBtn = 'absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/70 text-[12px] text-cream';

export function EditWishSheet({ wish, onClose, onSaved }: {
  wish: Wish; onClose: () => void; onSaved: (real: Wish) => void;
}) {
  const [text, setText] = useState(wish.text);
  const [keptPhotos, setKeptPhotos] = useState<string[]>(wish.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const newPreviews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => newPreviews.forEach((u) => URL.revokeObjectURL(u)), [newPreviews]);

  const total = keptPhotos.length + newFiles.length;

  function pickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    setNewFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS - keptPhotos.length));
  }

  async function submit() {
    if (!text.trim()) { setError('Điều ước không được để trống nhé.'); return; }
    const savedPin = sessionStorage.getItem('couple-pin') || pin;
    if (!savedPin) { setError('Nhập mã PIN chung của hai đứa nhé.'); return; }
    setSaving(true); setError('');
    try {
      const compressed = await Promise.all(
        newFiles.map(async (f, i) => new File([await compressImage(f)], `wish-${Date.now()}-${i}.jpg`, { type: 'image/jpeg' }))
      );
      const form = new FormData();
      form.append('id', wish.id);
      form.append('pin', savedPin);
      form.append('text', text.trim());
      form.append('keptPhotos', JSON.stringify(keptPhotos));
      compressed.forEach((f) => form.append('photos', f));
      const res = await fetch('/api/wishes', { method: 'PATCH', body: form });
      if (res.status === 401) { sessionStorage.removeItem('couple-pin'); throw new Error('Sai mã PIN rồi, thử lại nhé.'); }
      if (!res.ok) throw new Error('Không lưu được, thử lại nhé.');
      sessionStorage.setItem('couple-pin', savedPin);
      const data = await res.json();
      onSaved(data.wish);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="safe-bottom absolute bottom-0 left-0 right-0 rounded-t-[22px] border-t border-white/10 bg-panel px-5 pb-10 pt-3">
        <div className="mx-auto mb-5 h-1 w-[42px] rounded bg-smoke" />
        <h3 className="font-hand text-[30px] text-gold">Sửa điều ước</h3>

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-4 w-full rounded-xl border border-gold bg-ink p-4 leading-[1.7] text-cream focus:outline-none"
        />

        <p className="font-mono mt-5 text-[9px] tracking-[0.22em] text-smoke">
          ẢNH · TỐI ĐA {MAX_PHOTOS} ẢNH · {total}/{MAX_PHOTOS}
        </p>
        <div className="mt-2 flex flex-wrap gap-[10px]">
          {keptPhotos.map((src) => (
            <div key={src} className="relative">
              <img src={src} alt="" className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover" />
              <button type="button" onClick={() => setKeptPhotos((prev) => prev.filter((u) => u !== src))} className={xBtn}>✕</button>
            </div>
          ))}
          {newPreviews.map((url, i) => (
            <div key={url} className="relative">
              <img src={url} alt="" className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover" />
              <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))} className={xBtn}>✕</button>
            </div>
          ))}
          {total < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-[74px] w-[74px] flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-gold/50"
            >
              <span className="text-[22px] leading-none text-gold">+</span>
              <span className="font-mono text-[8px] tracking-[0.14em] text-smoke">THÊM ẢNH</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={pickPhotos} />
        </div>

        {!sessionStorage.getItem('couple-pin') && (
          <input
            value={pin} onChange={(e) => setPin(e.target.value)}
            placeholder="Mã PIN chung của hai đứa"
            inputMode="numeric"
            className="mt-4 w-full rounded-xl border border-white/15 bg-ink p-4 text-cream placeholder:text-smoke/60 focus:outline-none"
          />
        )}
        {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

        <div className="mt-5 flex gap-[10px]">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/15 py-[15px] text-[14px] text-smoke">Hủy</button>
          <button onClick={submit} disabled={saving} className="flex-[2] rounded-xl bg-gold py-[15px] text-[14px] font-semibold text-ink disabled:opacity-60">
            {saving ? 'Đang lưu…' : 'Lưu lại'}
          </button>
        </div>
      </div>
    </div>
  );
}
