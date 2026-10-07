import type { Wish } from '@/lib/types';
import { AddWishSheet } from './AddWishSheet';
import { Photo } from './Photo';

export function Wishlist({ wishes, configured, coupleNames }: { wishes: Wish[]; configured: boolean; coupleNames: [string, string] }) {
  return (
    <section className="px-[22px] py-16">
      <h2 className="font-hand text-[32px] text-gold">Mình còn muốn…</h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">Những điều chúng ta sẽ cùng nhau làm.</p>

      <div className="mt-6">
        {wishes.map((w) => (
          <div key={w.id} className="flex items-center gap-[14px] border-b border-white/10 px-1 py-[14px]">
            <div className={`h-[22px] w-[22px] shrink-0 rounded-full border ${w.done ? 'border-gold bg-gold' : 'border-smoke'}`} />
            <p className={`flex-1 text-[14px] leading-[1.6] ${w.done ? 'text-smoke line-through' : ''}`}>{w.text}</p>
            {w.photos[0] && <Photo src={w.photos[0]} className="h-16 w-16 shrink-0 rounded-lg" />}
          </div>
        ))}
      </div>

      <AddWishSheet configured={configured} coupleNames={coupleNames} />
    </section>
  );
}
