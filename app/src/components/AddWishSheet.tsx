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

interface Props {
  configured: boolean;
  coupleNames: [string, string];
  onOptimisticAdd: (temp: Wish) => void;
  onOptimisticFailed: (tempId: string, msg: string) => void;
  onOptimisticOk: () => void;
}

export function AddWishSheet({ configured, coupleNames, onOptimisticAdd, onOptimisticFailed, onOptimisticOk }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [by, setBy] = useState(coupleNames[0]);
  const [pin, setPin] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // FIX: cộng dồn ảnh mới vào danh sách cũ, không ghi đè
  function pickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ''; // cho chọn lại cùng 1 file
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
  }

  async function submit() {
    if (!text.trim()) { setError('Viết một điều ước đã nhé ♡'); return; }
    const savedPin = sessionStorage.getItem('couple-pin') || pin;
    if (!savedPin) { setError('Nhập mã PIN chung của hai đứa nhé.'); return; }
    setSaving(true); setError('');
    const tempId = `temp-${Date.now()}`;
    try {
      const compressed = await Promise.all(
        files.map(async (f, i) => new File([await compressImage(f)], `wish-${Date.now()}-${i}.jpg`, { type: 'image/jpeg' }))
      );
      // 1) CACHE ẢO: hiện ngay bằng ảnh local, không chờ upload
      const tempUrls = compressed.map((f) => URL.createObjectURL(f));
      onOptimisticAdd({
        id: tempId, text: text.trim(), photos: tempUrls,
        done: false, created_at: new Date().toISOString(), pending: true,
      });
      setOpen(false); setText(''); setFiles([]); setPin('');
      // 2) upload thật chạy ngầm phía sau
      const form = new FormData();
      form.append('pin', savedPin);
      form.append('text', text.trim());
      form.append('createdBy', by);
      compressed.forEach((f) => form.append('photos', f));
      const res = await fetch('/api/wishes', { method: 'POST', body: form });
      if (res.status === 401) { sessionStorage.removeItem('couple-pin'); throw new Error('Sai mã PIN rồi, thử lại nhé.'); }
      if (!res.ok) throw new Error('Có lỗi khi lưu, thử lại nhé.');
      sessionStorage.setItem('couple-pin', savedPin);
      onOptimisticOk(); // refresh: thay ảnh local bằng URL thật từ server
    } catch (e) {
      onOptimisticFailed(tempId, e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => configured && setOpen(true)}
        className="mt-5 w-full rounded-xl border border-dashed border-gold/50 py-[18px]"
      >
        <span className="flex items-center justify-center gap-2 text-gold">
          <span className="pulse-dot" />
          <span className="text-[13px]">Thêm điều ước mới</span>
        </span>
        {!configured && <span className="mt-1 block text-[11px] text-smoke">(kết nối Supabase để dùng)</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="safe-bottom absolute bottom-0 left-0 right-0 rounded-t-[22px] border-t border-white/10 bg-[#17171a] px-5 pb-10 pt-3">
            <div className="mx-auto mb-5 h-1 w-[42px] rounded bg-[#3c3c41]" />
            <h3 className="font-hand text-[30px] text-gold">Thêm điều ước</h3>

            <textarea
              value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Viết điều ước của hai đứa…"
              rows={3}
              className="mt-4 w-full rounded-xl border border-gold bg-[#0d0d0f] p-4 leading-[1.7] text-cream placeholder:text-smoke/60 focus:outline-none"
            />
            <p className="font-mono mt-2 text-[9px] tracking-[0.22em] text-smoke">VIẾT NGẮN GỌN, MỘT CÂU THÔI</p>

            <div className="mt-4 flex gap-2">
              {coupleNames.map((n) => (
                <button
                  key={n}
                  onClick={() => setBy(n)}
                  className={`rounded-full px-4 py-2 text-[13px] ${by === n ? 'bg-gold text-ink font-semibold' : 'border border-white/15 text-smoke'}`}
                >
                  {n} ♡
                </button>
              ))}
            </div>

            <p className="font-mono mt-5 text-[9px] tracking-[0.22em] text-smoke">
              ẢNH ĐÍNH KÈM · <span className="text-gold">KHÔNG BẮT BUỘC</span> · TỐI ĐA {MAX_PHOTOS} ẢNH
            </p>
            <div className="mt-2 flex flex-wrap gap-[10px]">
              {previews.map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Xóa ảnh này"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/70 text-[12px] text-cream"
                  >✕</button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
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
            <p className="mt-2 text-[11px] text-smoke">{files.length}/{MAX_PHOTOS} ảnh</p>

            {!sessionStorage.getItem('couple-pin') && (
              <input
                value={pin} onChange={(e) => setPin(e.target.value)}
                placeholder="Mã PIN chung của hai đứa"
                inputMode="numeric"
                className="mt-4 w-full rounded-xl border border-white/15 bg-[#0d0d0f] p-4 text-cream placeholder:text-smoke/60 focus:outline-none"
              />
            )}

            {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

            <div className="mt-5 flex gap-[10px]">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/15 py-[15px] text-[14px] text-smoke">
                Hủy
              </button>
              <button
                onClick={submit} disabled={saving}
                className="flex-[2] rounded-xl bg-gold py-[15px] text-[14px] font-semibold text-ink disabled:opacity-60"
              >
                {saving ? 'Đang lưu…' : 'Lưu lại'}
              </button>
            </div>
            <p className="font-mono mt-4 text-center text-[9px] tracking-[0.22em] text-gold">
              LƯU XONG → HIỆN NGAY TRÊN CẢ HAI MÁY
            </p>
          </div>
        </div>
      )}
    </>
  );
}
