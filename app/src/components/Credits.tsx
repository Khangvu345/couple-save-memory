'use client';
import { useState } from 'react';
import type { Couple } from '@/lib/types';

export function Credits({ couple }: { couple: Couple }) {
  const [paused, setPaused] = useState(false);
  const lines = (couple.love_letter ?? '').split('\n').filter((l) => l.trim());

  return (
    <section className={`relative overflow-hidden bg-[#050506] px-7 py-20 text-center ${paused ? 'credits-paused' : ''}`}>
      <div className="absolute left-[16%] top-[16%] h-[90px] w-[90px] rounded-full bg-gold/25 blur-2xl" />
      <div className="absolute right-[20%] top-[42%] h-[50px] w-[50px] rounded-full bg-gold/20 blur-xl" />
      <div className="absolute left-[28%] top-[68%] h-9 w-9 rounded-full bg-gold/15 blur-lg" />

      <button onClick={() => setPaused((p) => !p)} className="relative block w-full" aria-label="Chạm để tạm dừng / tiếp tục">
        <div className="credits-inner">
          <p className="font-mono text-[9px] tracking-[0.35em] text-smoke">DIRECTED BY</p>
          <p className="font-hand mt-2 text-[26px] text-cream">Định mệnh</p>

          <p className="font-mono mt-8 text-[9px] tracking-[0.35em] text-smoke">WRITTEN BY</p>
          <p className="font-hand mt-2 text-[26px] text-cream">{couple.name_a} &amp; {couple.name_b}</p>

          <p className="font-mono mt-8 text-[9px] tracking-[0.35em] text-smoke">STARRING</p>
          <p className="font-hand mt-2 text-[26px] text-cream">Hai chúng ta</p>

          <div className="mt-12 space-y-3">
            {lines.map((l, i) => (
              <p key={i} className="font-serif2 text-[16px] leading-[2]">
                {l}
              </p>
            ))}
          </div>
          <p className="mt-4 text-gold">♡</p>
        </div>
      </button>

      <div className="relative mt-10">
        <p className="font-display text-[34px] tracking-[0.08em]">THE END?</p>
        <p className="font-mono mt-2 text-[10px] tracking-[0.3em] text-gold">…TO BE CONTINUED</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-7 flex items-center justify-center gap-2 text-gold">
          <span className="pulse-dot" />
          <span className="text-[11px] tracking-[0.15em]">↺ XEM LẠI TỪ ĐẦU</span>
        </button>
        <p className="font-mono mt-6 text-[9px] tracking-[0.3em] text-smoke">
          {paused ? 'ĐANG TẠM DỪNG — CHẠM ĐỂ TIẾP TỤC' : 'CHẠM CHỮ ĐỂ TẠM DỪNG'}
        </p>
      </div>
    </section>
  );
}
