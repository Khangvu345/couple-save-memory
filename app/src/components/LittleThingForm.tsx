'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LittleThing } from '@/lib/types';
import { compressImage } from '@/lib/image';

const xBtn =
  'absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/70 text-[12px] text-cream';
const inputCls =
  'w-full rounded-xl border border-white/15 bg-[#0d0d0f] p-4 text-cream placeholder:text-smoke/60 focus:outline-none focus:border-gold/60';
const labelCls = 'font-mono mt-4 block text-[10px] tracking-[0.22em] text-smoke';

export function LittleThingForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: LittleThing | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [text, setText] = useState(initial?.text ?? '');
  const [note, setNote] = useState(initial?.handwritten_note ?? '');
  const [rotation, setRotation] = useState(initial?.rotation ?? 0);
  const [keptPhoto, setKeptPhoto] = useState<string | null>(initial?.photo_url ?? null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const newPreview = useMemo(() => (newFile ? URL.createObjectURL(newFile) : null), [newFile]);
  useEffect(() => () => { if (newPreview) URL.revokeObjectURL(newPreview); }, [newPreview]);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) setNewFile(f);
  }

  async function submit() {
    if (!text.trim()) {
      setError('Viết nội dung đã nhé.');
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
      let photoFile: File | null = null;
      if (newFile) {
        photoFile = new File([await compressImage(newFile)], `thing-${Date.now()}.jpg`, { type: 'image/jpeg' });
      }
      const form = new FormData();
      if (isEdit) form.append('id', initial!.id);
      form.append('pin', savedPin);
      form.append('text', text.trim());
      form.append('handwritten_note', note.trim());
      form.append('rotation', String(rotation));
      form.append('keptPhoto', keptPhoto ?? '');
      if (photoFile) form.append('photos', photoFile);
      const res = await fetch('/api/little-things', { method: isEdit ? 'PATCH' : 'POST', body: form });
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
        <h3 className="font-hand text-[30px] text-gold">{isEdit ? 'Sửa điều nhỏ' : 'Thêm điều nhỏ'}</h3>

        <label className={labelCls}>NỘI DUNG</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="VD: Em uống trà sữa luôn ít đá, 30% đường."
          className={`${inputCls} mt-2 leading-[1.7]`}
        />

        <label className={labelCls}>DÒNG VIẾT TAY (TÙY CHỌN)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: — 14.09 —"
          className={`${inputCls} mt-2`}
        />

        <label className={labelCls}>ĐỘ NGHIÊNG: {rotation}°</label>
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
          className="mt-3 w-full accent-[#e2a63d]"
        />
        <div className="mt-3 flex justify-center">
          <div
            className="relative max-w-[190px] rounded-[3px] bg-[#ece1c9] px-5 py-4 text-[#2b2416] shadow-[0_10px_26px_rgba(0,0,0,0.5)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <p className="whitespace-pre-line text-[13px] leading-[1.8]">{text || 'Xem trước mảnh giấy…'}</p>
            {note && <p className="font-hand mt-2 text-[17px] text-[#6b5f45]">{note}</p>}
          </div>
        </div>

        <p className="font-mono mt-5 text-[10px] tracking-[0.22em] text-smoke">ẢNH ĐÍNH KÈM (TÙY CHỌN)</p>
        <div className="mt-2 flex gap-[10px]">
          {(newPreview || keptPhoto) && (
            <div className="relative">
              <img
                src={newPreview ?? keptPhoto!}
                alt=""
                className="photo-tone h-[74px] w-[74px] rounded-[10px] object-cover"
              />
              <button
                type="button"
                onClick={() => { setNewFile(null); setKeptPhoto(null); }}
                className={xBtn}
              >
                ✕
              </button>
            </div>
          )}
          {!newPreview && !keptPhoto && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-[74px] w-[74px] flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-gold/50"
            >
              <span className="text-[22px] leading-none text-gold">+</span>
              <span className="font-mono text-[8px] tracking-[0.14em] text-smoke">THÊM ẢNH</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        </div>

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
