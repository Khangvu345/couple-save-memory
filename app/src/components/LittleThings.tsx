import type { LittleThing } from '@/lib/types';
import { Photo } from './Photo';

export function LittleThings({ things }: { things: LittleThing[] }) {
  return (
    <section className="cinema-surface relative overflow-hidden px-[22px] py-14">
      <h2 className="font-hand -rotate-2 text-[44px] leading-none text-gold">
        Những điều nhỏ <span className="text-[22px]">♡</span>
      </h2>
      <p className="mt-2 text-[12px] leading-[1.7] text-smoke">Những điều bình dị làm nên hạnh phúc lớn.</p>

      <img
        src="/asset/AdobeStock_551251692.png"
        alt=""
        aria-hidden="true"
        className="little-branch-asset"
      />
      <span className="little-branch-tape" aria-hidden="true" />

      <div className="relative z-10 mt-8 space-y-9 px-2">
        {things.map((t, i) => (
          <div key={t.id} className="relative min-h-[130px]" style={{ marginLeft: i % 2 === 1 ? 26 : 0 }}>
            <div
              className="paper-note relative max-w-[210px] px-[18px] py-5 text-paper-ink"
              style={{ transform: `rotate(${t.rotation}deg)` }}
            >
              <div className="absolute -top-[11px] left-1/2 h-[22px] w-[78px] -translate-x-1/2 rotate-[-4deg] bg-tape/70" />
              <p className="whitespace-pre-line text-[13px] leading-[1.8]">{t.text}</p>
              {t.handwritten_note && (
                <p className="font-hand mt-2 text-[17px] text-paper-ink/70">{t.handwritten_note}</p>
              )}
            </div>
            {t.photo_url && (
              <div className="absolute right-0 top-2 max-w-[120px] rotate-3 rounded-[3px] bg-cream p-2 pb-6 shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
                <Photo src={t.photo_url} className="aspect-square w-full rounded-[2px]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
