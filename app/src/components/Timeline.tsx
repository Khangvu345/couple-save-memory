'use client';
import { useState } from 'react';
import type { Memory } from '@/lib/types';
import { Photo } from './Photo';

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

/** Chữ hiện dần từng cụm khi mở câu chuyện. */
function RevealText({ text }: { text: string }) {
  const words = text.split(/(\s+)/);
  let wi = 0;
  return (
    <p className="text-[14px] leading-[1.9]">
      {words.map((w, i) =>
        /^\s+$/.test(w) ? (
          <span key={i}>{w}</span>
        ) : (
          <span key={i} className="word-reveal" style={{ animationDelay: `${(wi++) * 70}ms` }}>
            {w}
          </span>
        ),
      )}
    </p>
  );
}

function Story({ memory, open, onToggle }: { memory: Memory; open: boolean; onToggle: () => void }) {
  if (!open) return null;
  return (
    <div className="mt-3 rounded-[3px] bg-panel px-5 py-5">
      <RevealText text={memory.story} />
      <button onClick={onToggle} className="mt-4 font-mono text-[10px] tracking-[0.25em] text-smoke">
        CHẠM ĐỂ THU GỌN ▴
      </button>
    </div>
  );
}

function Item({ memory, first }: { memory: Memory; first: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const dateCls = first ? 'text-gold' : 'text-smoke';
  const dotCls = first ? 'bg-gold' : 'bg-smoke';

  return (
    <div className="relative mb-9 min-h-[104px] pr-[112px]">
      <div className={`absolute -left-[21px] top-[5px] h-[9px] w-[9px] rounded-full ${dotCls}`} />
      <p className={`font-mono text-[10px] tracking-[0.2em] ${dateCls}`}>{fmtDate(memory.date)}</p>

      {memory.layout === 'quote' ? (
        <button onClick={toggle} className="mt-2 block text-left">
          <p className="font-hand text-[26px] leading-[1.5] text-cream">“{memory.story}”</p>
        </button>
      ) : (
        <>
          {memory.title && <h3 className="mt-1 text-[15px] font-semibold">{memory.title}</h3>}
          {memory.teaser && <p className="mt-1 text-[13px] leading-[1.7] text-smoke">{memory.teaser}</p>}

          {memory.layout === 'polaroid' && (
            <button onClick={toggle} className="absolute right-0 top-1 block w-[98px] text-left">
              <div className="rotate-2 rounded-[2px] bg-[#e9dfca] p-[5px] pb-[16px] shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
                <Photo src={memory.photos[0]} className="aspect-square w-full rounded-[1px]" />
              </div>
            </button>
          )}

          {(memory.layout === 'big' || memory.layout === 'standard') && (
            <button onClick={toggle} className="absolute right-0 top-1 block w-[98px]">
              <div className="rotate-2 border-2 border-[#ded4c1] p-[3px] shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
                <Photo src={memory.photos[0]} className="aspect-square w-full rounded-none" />
              </div>
            </button>
          )}

          {memory.layout === 'pair' && (
            <button onClick={toggle} className="absolute right-0 top-1 flex w-[98px] gap-1 border-2 border-[#ded4c1] bg-[#ded4c1] p-[3px] shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
              <Photo src={memory.photos[0]} className="aspect-[3/4] min-w-0 flex-1" />
              <Photo src={memory.photos[1]} className="aspect-[3/4] min-w-0 flex-1" />
            </button>
          )}

          {!open && (
            <button onClick={toggle} className="mt-3 flex items-center gap-2 text-gold">
              <span className="pulse-dot" />
              <span className="text-[11px] tracking-[0.1em]">CHẠM ẢNH ĐỂ ĐỌC TIẾP</span>
            </button>
          )}
          <Story memory={memory} open={open} onToggle={toggle} />
        </>
      )}
    </div>
  );
}

export function Timeline({ memories }: { memories: Memory[] }) {
  return (
    <section className="cinema-surface px-[22px] py-16">
      <h2 className="font-display text-center text-[16px] tracking-[.12em] text-gold">HÀNH TRÌNH CỦA CHÚNG TA <span className="text-[10px]">●</span></h2>
      <div className="relative mt-6 pl-[22px]">
        <div className="absolute bottom-2 left-[5px] top-2 w-px bg-white/10" />
        {memories.map((m, i) => (
          <Item key={m.id} memory={m} first={i === 0} />
        ))}
        <p className="font-mono text-[10px] tracking-[0.25em] text-smoke">TO BE CONTINUED…</p>
      </div>
    </section>
  );
}
