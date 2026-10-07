import type { LittleThing } from '@/lib/types';
import { Photo } from './Photo';

export function LittleThings({ things }: { things: LittleThing[] }) {
  return (
    <section className="px-[22px] py-16">
      <h2 className="font-hand text-[32px] text-gold">
        Những điều nhỏ <span className="text-[22px]">♡</span>
      </h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">Những điều bình dị làm nên hạnh phúc lớn.</p>

      <div className="relative mt-8">
        {things.map((t, i) => (
          <div key={t.id} className={i > 0 ? 'mt-8' : ''} style={{ marginLeft: i % 2 === 1 ? 28 : 0 }}>
            <div
              className="relative max-w-[210px] rounded-[3px] bg-[#ece1c9] px-[18px] py-5 text-[#2b2416] shadow-[0_10px_26px_rgba(0,0,0,0.5)]"
              style={{ transform: `rotate(${t.rotation}deg)` }}
            >
              <div className="absolute -top-[11px] left-1/2 h-[22px] w-[78px] -translate-x-1/2 rotate-[-4deg] bg-[#d2b98c]/40" />
              <p className="whitespace-pre-line text-[13px] leading-[1.8]">{t.text}</p>
              {t.handwritten_note && (
                <p className="font-hand mt-2 text-[17px] text-[#6b5f45]">{t.handwritten_note}</p>
              )}
            </div>
            {t.photo_url && (
              <div className="absolute right-0 top-2 max-w-[120px] rotate-3 rounded-[3px] bg-[#f4efe2] p-2 pb-6 shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
                <Photo src={t.photo_url} className="aspect-square w-full rounded-[2px]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
