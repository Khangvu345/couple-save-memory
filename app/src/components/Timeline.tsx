'use client';
import { useEffect, useState } from 'react';
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
  const effect = memory.text_effect ?? 'fade';
  return (
    <div className="mt-3 rounded-[3px] bg-panel px-5 py-5">
      {effect === 'typewriter' ? <TypewriterText text={memory.story} /> : <RevealText text={memory.story} />}
      <button onClick={onToggle} className="mt-4 font-mono text-[10px] tracking-[0.25em] text-smoke">
        CHẠM ĐỂ THU GỌN ▴
      </button>
    </div>
  );
}

/** Chữ hiện từng ký tự như gõ máy, kèm con trỏ nhấp nháy. */
function TypewriterText({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(text.length);
      return;
    }
    setN(0);
    if (!text.length) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 20);
    return () => clearInterval(id);
  }, [text]);
  const done = n >= text.length;
  return (
    <p className="text-[14px] leading-[1.9]">
      {text.slice(0, n)}
      {!done && (
        <span aria-hidden="true" className="type-caret">
          ▍
        </span>
      )}
    </p>
  );
}

function Item({ memory, first }: { memory: Memory; first: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const dateCls = 'text-gold';
  const dotCls = 'bg-gold';
  const photos = memory.photos ?? [];
  const hasPhotos = photos.length > 0;
  // chỉ standard / polaroid có ảnh góc phải; các layout còn lại ảnh full-width hoặc không ảnh
  const sidePhoto = hasPhotos && (memory.layout === 'standard' || memory.layout === 'polaroid');
  // polaroid to (140px + viền trắng) nên item phải cao tối thiểu ~180px,
  // không thì ảnh absolute tràn xuống đè lên item phía dưới
  const minH = !sidePhoto ? '' : memory.layout === 'polaroid' ? 'min-h-[180px]' : 'min-h-[116px]';

  return (
    <div className={`relative mb-9 ${minH} ${sidePhoto ? (memory.layout === 'polaroid' ? 'pr-[156px]' : 'pr-[112px]') : ''}`}>
      <div className={`absolute -left-[21px] top-[5px] h-[9px] w-[9px] rounded-full ${dotCls}`} />
      <p className={`font-mono text-[10px] tracking-[0.2em] ${dateCls}`}>{fmtDate(memory.date)}</p>

      {memory.layout === 'quote' ? (
        /* quote: thuần chữ — chỉ ngày + nội dung, không ảnh, không nút mở rộng */
        <p className="font-hand mt-2 text-[26px] leading-[1.5] text-cream">“{memory.story}”</p>
      ) : (
        <>
          {memory.title && <h3 className="mt-1 text-[15px] font-semibold">{memory.title}</h3>}
          {memory.teaser && <p className="mt-1 text-[13px] leading-[1.7] text-smoke">{memory.teaser}</p>}

          {/* standard: thumbnail nhỏ góc phải */}
          {memory.layout === 'standard' && hasPhotos && (
            <button onClick={toggle} className="absolute right-0 top-1 block w-[98px]">
              <div className="rotate-2 border-2 border-cream p-[3px] shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
                <Photo src={photos[0]} className="aspect-square w-full rounded-none" />
              </div>
            </button>
          )}

          {/* polaroid: to hơn + chữ viết tay trên viền */}
          {memory.layout === 'polaroid' && hasPhotos && (
            <button onClick={toggle} className="absolute right-0 top-1 block w-[140px] text-left">
              <div className="rotate-2 rounded-[2px] bg-cream p-[6px] pb-[10px] shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
                <Photo src={photos[0]} className="aspect-square w-full rounded-[1px]" />
                {/* chữ viết tay trên viền ảnh — như polaroid thật; trống thì hiện tiêu đề */}
                {(memory.handwritten_note || memory.title) && (
                  <p className="font-hand mt-1 truncate text-center text-[15px] leading-none text-[#6b5f45]">
                    {memory.handwritten_note || memory.title}
                  </p>
                )}
              </div>
            </button>
          )}

          {/* big: ảnh full-width 16:10 dưới chữ */}
          {memory.layout === 'big' && hasPhotos && (
            <button onClick={toggle} className="mt-3 block w-full text-left">
              <div className="-rotate-1 border-2 border-cream p-[4px] shadow-[0_14px_28px_rgba(0,0,0,0.55)]">
                <Photo src={photos[0]} className="aspect-[16/10] w-full rounded-none" />
              </div>
            </button>
          )}

          {/* pair: 2 ảnh lớn cạnh nhau dưới chữ */}
          {memory.layout === 'pair' && hasPhotos && (
            <button onClick={toggle} className="mt-3 flex w-full gap-2 text-left">
              {[0, 1].map(
                (i) =>
                  photos[i] && (
                    <div
                      key={i}
                      className={`${i === 0 ? '-rotate-2' : 'rotate-2'} min-w-0 flex-1 border-2 border-cream bg-cream p-[3px] shadow-[0_10px_22px_rgba(0,0,0,0.55)]`}
                    >
                      <Photo src={photos[i]} className="aspect-[3/4] w-full" />
                    </div>
                  ),
              )}
            </button>
          )}

          {memory.story && !open && (
            <button onClick={toggle} className="mt-3 flex items-center gap-2 text-gold">
              <span className="pulse-dot" />
              <span className="text-[11px] tracking-[0.1em]">{hasPhotos ? 'CHẠM ẢNH ĐỂ ĐỌC TIẾP' : 'ĐỌC CÂU CHUYỆN'}</span>
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
    <section className="cinema-surface px-[22px] py-14">
      <h2 className="font-display text-center text-[16px] tracking-[.12em] text-gold">HÀNH TRÌNH CỦA CHÚNG TA <span className="text-[12px]">♡</span></h2>
      <div className="relative mt-6 pl-[22px]">
        <div className="absolute bottom-2 left-[5px] top-2 w-px bg-gold/50" />
        {memories.map((m, i) => (
          <Item key={m.id} memory={m} first={i === 0} />
        ))}
        <p className="font-mono text-[10px] tracking-[0.25em] text-gold">CHƯA HẾT ĐÂU.....</p>
      </div>
    </section>
  );
}
