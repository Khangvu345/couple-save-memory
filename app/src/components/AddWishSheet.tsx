'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Photo } from './Photo';

export function AddWishSheet({ configured, coupleNames }: { configured: boolean; coupleNames: [string, string] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [by, setBy] = useState(coupleNames[0]);
  const [pin, setPin] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const previews = files.map((f) => URL.createObjectURL(f));

  async function submit() {
    if (!text.trim()) { setError('Viết một điều ước đã nhé ♡'); return; }
    const savedPin = sessionStorage.getItem('couple-pin') || pin;
    if (!savedPin) { setError('Nhập mã PIN chung của hai đứa nhé.'); return; }
    setSaving(true); setError('');
    try {
      const form = new FormData();
      form.append('pin', savedPin);
      form.append('text', text.trim());
      form.append('createdBy', by);
      files.forEach((f) => form.append('photos', f));
      const res = await fetch('/api/wishes', { method: 'POST', body: form });
      if (res.status === 401) { sessionStorage.removeItem('couple-pin'); throw new Error('Sai mã PIN rồi, thử lại nhé.'); }
      if (!res.ok) throw new Error('Có lỗi khi lưu, thử lại nhé.');
      sessionStorage.setItem('couple-pin', savedPin);
      setOpen(false); setText(''); setFiles([]); setPin('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
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
              ẢNH ĐÍNH KÈM · <span className="text-gold">KHÔNG BẮT BUỘC</span>
            </p>
            <div className="mt-2 flex gap-[10px]">
              {previews.map((url, i) => (
                <img key={i} src={url} alt="" className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover" />
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-[74px] w-[74px] flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-gold/50"
              >
                <span className="text-[22px] leading-none text-gold">+</span>
                <span className="font-mono text-[8px] tracking-[0.14em] text-smoke">THÊM ẢNH</span>
              </button>
              <input
                ref={fileRef} type="file" accept="image/*" multiple hidden
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 4))}
              />
            </div>

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
