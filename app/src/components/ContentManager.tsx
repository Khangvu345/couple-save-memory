'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Memory, LittleThing } from '@/lib/types';
import { compressImage } from '@/lib/image';
import { MemoryForm } from './MemoryForm';
import { LittleThingForm } from './LittleThingForm';

/** KHU VỰC QUẢN TRỊ TẠM THỜI — đặt cuối trang sau Credits.
 *  Sau khi nhập đủ nội dung: xóa dòng <ContentManager /> trong page.tsx là ẩn đi. */

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};

const rowBtn = 'shrink-0 rounded-full border border-white/15 px-3 py-2 text-[13px] text-smoke';

/** Ô đổi 1 ảnh của couple (hero / bộ đếm): chọn ảnh → preview → lưu. */
function CouplePhotoField({
  label,
  fieldName,
  current,
  onSaved,
  onAuthError,
}: {
  label: string;
  fieldName: 'photos' | 'counter_photos';
  current: string | null;
  onSaved: (url: string) => void;
  onAuthError: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function save() {
    if (!file) return;
    setSaving(true);
    try {
      const blob = await compressImage(file, 2000, 0.85);
      const form = new FormData();
      form.append('pin', sessionStorage.getItem('couple-pin') ?? '');
      form.append(fieldName, new File([blob], `couple-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      const res = await fetch('/api/couple', { method: 'PATCH', body: form });
      if (res.status === 401) {
        onAuthError();
        throw new Error('Sai mã PIN.');
      }
      if (!res.ok) throw new Error('Không lưu được.');
      const data = await res.json();
      setFile(null);
      onSaved(fieldName === 'photos' ? data.hero_photo_url : data.counter_photo_url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#141417] p-4">
      <p className="font-mono text-[10px] tracking-[0.22em] text-smoke">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        {preview || current ? (
          <img
            src={preview ?? current!}
            alt=""
            className="photo-tone h-[90px] w-[90px] shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 px-2 text-center text-[11px] text-smoke">
            chưa có ảnh
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <button onClick={() => inputRef.current?.click()} className={rowBtn}>
            {file ? 'Chọn ảnh khác' : 'Chọn ảnh mới'}
          </button>
          {file && (
            <button
              onClick={save}
              disabled={saving}
              className="shrink-0 rounded-full bg-gold px-3 py-2 text-[13px] font-semibold text-ink disabled:opacity-60"
            >
              {saving ? 'Đang lưu…' : 'Lưu ảnh'}
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) setFile(f);
        }}
      />
    </div>
  );
}

export function ContentManager({
  memories,
  things,
  heroPhotoUrl,
  counterPhotoUrl,
}: {
  memories: Memory[];
  things: LittleThing[];
  heroPhotoUrl?: string | null;
  counterPhotoUrl?: string | null;
}) {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== 'undefined' && !!sessionStorage.getItem('couple-pin'),
  );
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<'memories' | 'things'>('memories');
  const [memoryForm, setMemoryForm] = useState<{ open: boolean; initial: Memory | null }>({
    open: false,
    initial: null,
  });
  const [thingForm, setThingForm] = useState<{ open: boolean; initial: LittleThing | null }>({
    open: false,
    initial: null,
  });
  const router = useRouter();

  const [heroSrc, setHeroSrc] = useState<string | null>(heroPhotoUrl ?? null);
  const [counterSrc, setCounterSrc] = useState<string | null>(counterPhotoUrl ?? null);

  async function unlock() {
    if (!pin.trim()) return;
    setChecking(true);
    setPinError('');
    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      if (!res.ok) throw new Error();
      sessionStorage.setItem('couple-pin', pin.trim());
      setUnlocked(true);
    } catch {
      setPinError('Sai mã PIN rồi.');
    } finally {
      setChecking(false);
    }
  }

  function getPin() {
    return sessionStorage.getItem('couple-pin') ?? '';
  }

  function needRelock() {
    sessionStorage.removeItem('couple-pin');
    setUnlocked(false);
  }

  async function move(url: string, id: string, dir: 'up' | 'down') {
    const form = new FormData();
    form.append('id', id);
    form.append('pin', getPin());
    form.append('move', dir);
    const res = await fetch(url, { method: 'PATCH', body: form });
    if (res.status === 401) {
      needRelock();
      return;
    }
    if (res.ok) router.refresh();
  }

  async function remove(url: string, id: string, what: string) {
    if (!window.confirm(`Xóa ${what} này?`)) return;
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pin: getPin() }),
      });
      if (res.status === 401) {
        needRelock();
        throw new Error('Sai mã PIN.');
      }
      if (!res.ok) throw new Error('Không xóa được.');
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    }
  }

  return (
    <section className="border-t border-white/10 bg-[#0c0c0e] px-[22px] py-16">
      <p className="font-mono text-[10px] tracking-[0.3em] text-smoke">KHU VỰC TẠM THỜI</p>
      <h2 className="font-hand mt-2 text-[32px] text-gold">Quản lý nội dung</h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">
        Thêm kỷ niệm mà không cần vào database. Nhập xong thì ẩn khu vực này đi.
      </p>

      {!unlocked ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-[#141417] p-4">
          <p className="text-[13px] text-cream">Nhập mã PIN chung của hai đứa để mở khóa:</p>
          <div className="mt-3 flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && unlock()}
              placeholder="Mã PIN"
              inputMode="numeric"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#0d0d0f] p-3 text-cream placeholder:text-smoke/60 focus:outline-none focus:border-gold/60"
            />
            <button
              onClick={unlock}
              disabled={checking}
              className="shrink-0 rounded-xl bg-gold px-5 py-3 text-[14px] font-semibold text-ink disabled:opacity-60"
            >
              {checking ? '…' : 'Mở khóa'}
            </button>
          </div>
          {pinError && <p className="mt-2 text-[13px] text-red-400">{pinError}</p>}
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <CouplePhotoField
              label="ẢNH HERO"
              fieldName="photos"
              current={heroSrc}
              onSaved={(url) => {
                setHeroSrc(url);
                router.refresh();
              }}
              onAuthError={needRelock}
            />
            <CouplePhotoField
              label="ẢNH BỘ ĐẾM"
              fieldName="counter_photos"
              current={counterSrc}
              onSaved={(url) => {
                setCounterSrc(url);
                router.refresh();
              }}
              onAuthError={needRelock}
            />
          </div>

          <div className="mt-4 flex gap-2">
            {(
              [
                ['memories', `Timeline (${memories.length})`],
                ['things', `Điều nhỏ (${things.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 rounded-xl border py-3 text-[13px] font-medium ${
                  tab === id ? 'border-gold bg-gold/10 text-gold' : 'border-white/15 text-smoke'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'memories' && (
            <div className="mt-4">
              <button
                onClick={() => setMemoryForm({ open: true, initial: null })}
                className="w-full rounded-xl border border-dashed border-gold/50 py-[15px] text-[13px] text-gold"
              >
                ＋ Thêm kỷ niệm
              </button>
              <div className="mt-3 space-y-2">
                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#151516] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] tracking-[0.18em] text-gold">{fmtDate(m.date)}</p>
                      <p className="truncate text-[13px] text-cream">{m.title || '(không tiêu đề)'}</p>
                      <p className="font-mono text-[9px] tracking-[0.14em] text-smoke">
                        {m.layout} · {m.photos.length} ảnh
                      </p>
                    </div>
                    <button onClick={() => move('/api/memories', m.id, 'up')} className={rowBtn} aria-label="Lên">
                      ↑
                    </button>
                    <button onClick={() => move('/api/memories', m.id, 'down')} className={rowBtn} aria-label="Xuống">
                      ↓
                    </button>
                    <button onClick={() => setMemoryForm({ open: true, initial: m })} className={rowBtn} aria-label="Sửa">
                      ✎
                    </button>
                    <button
                      onClick={() => remove('/api/memories', m.id, 'kỷ niệm')}
                      className={rowBtn}
                      aria-label="Xóa"
                    >
                      🗑
                    </button>
                  </div>
                ))}
                {memories.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-smoke">Chưa có kỷ niệm nào.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'things' && (
            <div className="mt-4">
              <button
                onClick={() => setThingForm({ open: true, initial: null })}
                className="w-full rounded-xl border border-dashed border-gold/50 py-[15px] text-[13px] text-gold"
              >
                ＋ Thêm điều nhỏ
              </button>
              <div className="mt-3 space-y-2">
                {things.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#151516] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-cream">{t.text}</p>
                      <p className="font-mono text-[9px] tracking-[0.14em] text-smoke">
                        nghiêng {t.rotation}° · {t.photo_url ? 'có ảnh' : 'không ảnh'}
                      </p>
                    </div>
                    <button onClick={() => move('/api/little-things', t.id, 'up')} className={rowBtn} aria-label="Lên">
                      ↑
                    </button>
                    <button onClick={() => move('/api/little-things', t.id, 'down')} className={rowBtn} aria-label="Xuống">
                      ↓
                    </button>
                    <button onClick={() => setThingForm({ open: true, initial: t })} className={rowBtn} aria-label="Sửa">
                      ✎
                    </button>
                    <button
                      onClick={() => remove('/api/little-things', t.id, 'điều nhỏ')}
                      className={rowBtn}
                      aria-label="Xóa"
                    >
                      🗑
                    </button>
                  </div>
                ))}
                {things.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-smoke">Chưa có điều nhỏ nào.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {memoryForm.open && (
        <MemoryForm
          initial={memoryForm.initial}
          onClose={() => setMemoryForm({ open: false, initial: null })}
          onSaved={() => {
            setMemoryForm({ open: false, initial: null });
            router.refresh();
          }}
        />
      )}
      {thingForm.open && (
        <LittleThingForm
          initial={thingForm.initial}
          onClose={() => setThingForm({ open: false, initial: null })}
          onSaved={() => {
            setThingForm({ open: false, initial: null });
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
