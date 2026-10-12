'use client';
import { useEffect, useState } from 'react';
import type { Wish } from '@/lib/types';
import { AddWishSheet } from './AddWishSheet';
import { EditWishSheet } from './EditWishSheet';
import { Photo } from './Photo';

type WishItem = Wish & { pending?: boolean };

export function Wishlist({ wishes, configured, coupleNames }: {
  wishes: Wish[]; configured: boolean; coupleNames: [string, string];
}) {
  const [items, setItems] = useState<WishItem[]>(wishes);
  const [editing, setEditing] = useState<Wish | null>(null);
  const [error, setError] = useState('');

  // dọn ảnh blob tạm khi dữ liệu server về
  useEffect(() => {
    setItems((prev) => {
      prev.forEach((w) => {
        if (w.pending) (w.photos ?? []).forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
      });
      return wishes;
    });
  }, [wishes]);

  // thay item tạm bằng row thật từ server — đúng lúc dữ liệu về
  function swapTemp(tempId: string, real: Wish) {
    setItems((prev) => {
      prev.forEach((w) => {
        if (w.id === tempId) (w.photos ?? []).forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
      });
      return prev.map((w) => (w.id === tempId ? real : w));
    });
  }

  return (
    <section className="cinema-surface px-[22px] py-16">
      <h2 className="font-hand text-[32px] text-gold">Mình còn muốn…</h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">Những điều chúng ta sẽ cùng nhau làm.</p>
      {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {items.map((w) => (
          <div key={w.id} className="rounded-lg border border-gold/35 bg-[#151516] p-4">
            {/* hàng 1: tròn + chữ full-width + nút sửa */}
            <div className="flex items-start gap-[14px]">
              <div className={`mt-[2px] h-[22px] w-[22px] shrink-0 rounded-full border ${w.done ? 'border-gold bg-gold' : 'border-smoke'}`} />
              <div className="min-w-0 flex-1">
                <p className={`break-words text-[14px] leading-[1.6] ${w.done ? 'text-smoke line-through' : ''}`}>
                  {w.text}
                  {w.pending && <span className="text-gold"> · đang lưu…</span>}
                </p>
                {w.created_by && (
                  <p className="font-hand mt-1 text-[16px] leading-none text-smoke">— {w.created_by} ♡</p>
                )}
              </div>
              {!w.pending && (
                <button
                  onClick={() => { setEditing(w); setError(''); }}
                  aria-label="Sửa điều ước"
                  className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-[13px] text-smoke"
                >✎</button>
              )}
            </div>
            {/* hàng 2: ảnh nằm dưới, thẳng hàng với chữ */}
            {(w.photos ?? []).length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pl-9">
                {(w.photos ?? []).map((src, i) => (
                  <Photo key={`${w.id}-${i}`} src={src} className="h-[64px] w-[64px] shrink-0 rounded-lg" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AddWishSheet
        configured={configured}
        coupleNames={coupleNames}
        onOptimisticAdd={(temp) => { setError(''); setItems((prev) => [temp, ...prev]); }}
        onOptimisticFailed={(tempId, msg) => {
          setItems((prev) => prev.filter((w) => w.id !== tempId));
          setError(msg);
        }}
        onOptimisticOk={(tempId, real) => swapTemp(tempId, real)}
      />

      <p className="mt-8 text-center font-hand text-[17px] text-smoke/70">giữ ảnh một chút để ngắm kỹ hơn ♡</p>

      {editing && (
        <EditWishSheet
          wish={editing}
          onClose={() => setEditing(null)}
          onSaved={(real) => {
            setEditing(null);
            setItems((prev) => prev.map((w) => (w.id === real.id ? real : w)));
          }}
        />
      )}
    </section>
  );
}