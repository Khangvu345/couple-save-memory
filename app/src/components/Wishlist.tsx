import type { Wish } from '@/lib/types';
import { AddWishSheet } from './AddWishSheet';
import { Photo } from './Photo';

export function Wishlist({ wishes, configured, coupleNames }: { wishes: Wish[]; configured: boolean; coupleNames: [string, string] }) {
  return (
    <section className="cinema-surface px-[22px] py-16">
      <h2 className="font-hand text-[32px] text-gold">Mình còn muốn…</h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">Những điều chúng ta sẽ cùng nhau làm.</p>

      <div className="mt-6 space-y-3">
        {wishes.map((w) => (
          <div key={w.id} className="flex min-h-[70px] items-center gap-[14px] overflow-hidden rounded-lg border border-gold/35 bg-[#151516] pl-4">
            <div className={`h-[22px] w-[22px] shrink-0 rounded-full border ${w.done ? 'border-gold bg-gold' : 'border-smoke'}`} />
            <p className={`flex-1 text-[14px] leading-[1.6] ${w.done ? 'text-smoke line-through' : ''}`}>{w.text}</p>
            {(w.photos ?? []).length > 0 && (
              <div className="flex shrink-0 gap-2 overflow-x-auto py-2 pr-1">
              {(w.photos ?? []).map((src, i) => (
              <Photo key={`${w.id}-${i}`} src={src} className="h-[56px] w-[56px] rounded-lg" />
            ))}
  </div>
)}
          </div>
        ))}
      </div>

      <AddWishSheet configured={configured} coupleNames={coupleNames} />
    </section>
  );
}
