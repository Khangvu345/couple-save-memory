'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  // khi server trả dữ liệu mới (sau refresh): dọn ảnh local tạm, thay bằng dữ liệu thật
  useEffect(() => {
    setItems((prev) => {
      prev.forEach((w) => {
        if (w.pending) (w.photos ?? []).forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
      });
      return wishes;
    });
  }, [wishes]);

  return (
    <section className="cinema-surface px-[22px] py-16">
      <h2 className="font-hand text-[32px] text-gold">Mình còn muốn…</h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">Những điều chúng ta sẽ cùng nhau làm.</p>
      {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {items.map((w) => (
          <div key={w.id} className="flex min-h-[70px] items-center gap-[14px] overflow-hidden rounded-lg border border-gold/35 bg-[#151516] pl-4">
            <div className={`h-[22px] w-[22px] shrink-0 rounded-full border ${w.done ? 'border-gold bg-gold' : 'border-smoke'}`} />
            <p className={`flex-1 text-[14px] leading-[1.6] ${w.done ? 'text-smoke line-through' : ''}`}>
              {w.text}
              {w.pending && <span className="text-gold"> · đang lưu…</span>}
            </p>
            {(w.photos ?? []).length > 0 && (
              <div className="flex shrink-0 gap-2 overflow-x-auto py-2 pr-1">
                {(w.photos ?? []).map((src, i) => (
                  <Photo key={`${w.id}-${i}`} src={src} className="h-[56px] w-[56px] rounded-lg" />
                ))}
              </div>
            )}
            {!w.pending && (
              <button
                onClick={() => { setEditing(w); setError(''); }}
                aria-label="Sửa điều ước"
                className="mr-2 shrink-0 rounded-full border border-white/15 px-3 py-2 text-[13px] text-smoke"
              >✎</button>
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
        onOptimisticOk={() => router.refresh()}
      />

      {editing && (
        <EditWishSheet
          wish={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}
    </section>
  );
}
