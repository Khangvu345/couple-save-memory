'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Memory, MemoryLayout } from '@/lib/types';
import { compressImage } from '@/lib/image';

const MAX_PHOTOS = 4;

const LAYOUTS: { id: MemoryLayout; label: string; hint: string }[] = [
  { id: 'standard', label: 'Chuẩn', hint: '1 ảnh 4:3' },
  { id: 'big', label: 'Ảnh lớn', hint: '1 ảnh 16:10' },
  { id: 'polaroid', label: 'Polaroid', hint: '1 ảnh nhỏ nghiêng' },
  { id: 'pair', label: '2 ảnh nghiêng', hint: '2 ảnh dọc' },
  { id: 'quote', label: 'Chỉ câu nói', hint: 'không cần ảnh' },
];

const xBtn =
  'absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/70 text-[12px] text-cream';
const inputCls =
  'w-full rounded-xl border border-white/15 bg-[#0d0d0f] p-4 text-cream placeholder:text-smoke/60 focus:outline-none focus:border-gold/60';
const labelCls = 'font-mono mt-4 block text-[10px] tracking-[0.22em] text-smoke';

export function MemoryForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Memory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date?.slice(0, 10) ?? today);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [teaser, setTeaser] = useState(initial?.teaser ?? '');
  const [story, setStory] = useState(initial?.story ?? '');
  const [layout, setLayout] = useState<MemoryLayout>(initial?.layout ?? 'standard');
  const [keptPhotos, setKeptPhotos] = useState<string[]>(initial?.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const newPreviews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => newPreviews.forEach((u) => URL.revokeObjectURL(u)), [newPreviews]);

  const totalPhotos = keptPhotos.length + newFiles.length;
  const needPhotos = layout !== 'quote';

  function pickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    setNewFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS - keptPhotos.length));
  }

  async function submit() {
    if (!date) {
      setError('Chọn ngày nhé.');
      return;
    }
    const savedPin = sessionStorage.getItem('couple-pin') || pin;
    if (!savedPin) {
      setError('Nhập mã PIN chung của hai đứa nhé.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const compressed = await Promise.all(
        newFiles.map(
          async (f, i) => new File([await compressImage(f)], `memory-${Date.now()}-${i}.jpg`, { type: 'image/jpeg' }),
        ),
      );
      const form = new FormData();
      if (isEdit) form.append('id', initial!.id);
      form.append('pin', savedPin);
      form.append('date', date);
      form.append('title', title.trim());
      form.append('teaser', teaser.trim());
      form.append('story', story.trim());
      form.append('layout', layout);
      form.append('keptPhotos', JSON.stringify(keptPhotos));
      compressed.forEach((f) => form.append('photos', f));
      const res = await fetch('/api/memories', { method: isEdit ? 'PATCH' : 'POST', body: form });
      if (res.status === 401) {
        sessionStorage.removeItem('couple-pin');
        throw new Error('Sai mã PIN rồi, thử lại nhé.');
      }
      if (!res.ok) throw new Error('Không lưu được, thử lại nhé.');
      sessionStorage.setItem('couple-pin', savedPin);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="safe-bottom absolute bottom-0 left-0 right-0 max-h-[92svh] overflow-y-auto rounded-t-[22px] border-t border-white/10 bg-[#17171a] px-5 pb-10 pt-3">
        <div className="mx-auto mb-5 h-1 w-[42px] rounded bg-[#3c3c41]" />
        <h3 className="font-hand text-[30px] text-gold">{isEdit ? 'Sửa kỷ niệm' : 'Thêm kỷ niệm'}</h3>

        <label className={labelCls}>NGÀY</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} mt-2`} />

        <label className={labelCls}>TIÊU ĐỀ</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Buổi hẹn đầu tiên"
          className={`${inputCls} mt-2`}
        />

        <label className={labelCls}>TEASER (DÒNG HIỆN SẴN)</label>
        <input
          value={teaser}
          onChange={(e) => setTeaser(e.target.value)}
          placeholder="1 câu ngắn hiện sẵn dưới ảnh"
          className={`${inputCls} mt-2`}
        />

        <label className={labelCls}>CÂU CHUYỆN ĐẦY ĐỦ (CHẠM ẢNH ĐỂ ĐỌC)</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={4}
          placeholder="Kể chi tiết kỷ niệm…"
          className={`${inputCls} mt-2 leading-[1.7]`}
        />

        <label className={labelCls}>KIỂU HIỂN THỊ</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLayout(l.id)}
              className={`rounded-xl border px-3 py-2 text-left ${
                layout === l.id ? 'border-gold bg-gold/10' : 'border-white/15'
              }`}
            >
              <span className={`block text-[13px] font-medium ${layout === l.id ? 'text-gold' : 'text-cream'}`}>
                {l.label}
              </span>
              <span className="block text-[10px] text-smoke">{l.hint}</span>
            </button>
          ))}
        </div>

        {needPhotos && (
          <>
            <p className="font-mono mt-5 text-[10px] tracking-[0.22em] text-smoke">
              ẢNH · TỐI ĐA {MAX_PHOTOS} ẢNH · {totalPhotos}/{MAX_PHOTOS}
            </p>
            <div className="mt-2 flex flex-wrap gap-[10px]">
              {keptPhotos.map((src) => (
                <div key={src} className="relative">
                  <img src={src} alt="" className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setKeptPhotos((prev) => prev.filter((u) => u !== src))}
                    className={xBtn}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover" />
                  <button
                    type="button"
                    onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                    className={xBtn}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {totalPhotos < MAX_PHOTOS && (
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
          </>
        )}

        {!sessionStorage.getItem('couple-pin') && (
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Mã PIN chung của hai đứa"
            inputMode="numeric"
            className={`${inputCls} mt-4`}
          />
        )}
        {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

        <div className="mt-5 flex gap-[10px]">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/15 py-[15px] text-[14px] text-smoke"
          >
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-[2] rounded-xl bg-gold py-[15px] text-[14px] font-semibold text-ink disabled:opacity-60"
          >
            {saving ? 'Đang lưu…' : 'Lưu lại'}
          </button>
        </div>
      </div>
    </div>
  );
}
