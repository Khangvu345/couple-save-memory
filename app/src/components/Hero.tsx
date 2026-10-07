import type { Couple } from '@/lib/types';
import { Photo } from './Photo';

function Letters({ text, delayBase = 0 }: { text: string; delayBase?: number }) {
  const chars = Array.from(text.normalize('NFC'));
  return (
    <span aria-label={text}>
      {chars.map((ch, i) => (
        <span key={i} className="letter-reveal" style={{ animationDelay: `${delayBase + i * 45}ms` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

export function Hero({ couple }: { couple: Couple }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden text-center">
      {/* nền ảnh hero */}
      <div className="absolute inset-0">
        <Photo src={couple.hero_photo_url} className="h-full w-full" label="ẢNH HERO" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink" />
      </div>
      {/* bokeh */}
      <div className="absolute left-[12%] top-[18%] h-28 w-28 rounded-full bg-gold/25 blur-2xl" />
      <div className="absolute right-[14%] top-[34%] h-16 w-16 rounded-full bg-gold/20 blur-xl" />

      <div className="safe-top relative z-10 px-6 pt-16">
        <p className="font-hand text-5xl text-gold">
          <Letters text="Bộ phim" />
        </p>
        <h1 className="font-display mt-1 text-6xl tracking-wide">
          <Letters text="CỦA CHÚNG TA" delayBase={350} />
        </h1>
        <p className="font-hand mt-3 text-2xl text-cream">
          {couple.name_a} &amp; {couple.name_b}
        </p>
      </div>

      <div className="safe-bottom absolute bottom-10 left-0 right-0 z-10 text-center">
        <a href="#counter">
          <p className="font-mono text-[10px] tracking-[0.3em] text-smoke">CUỘN XUỐNG ĐỂ BẮT ĐẦU</p>
          <p className="mt-2 text-gold" style={{ animation: 'pulse-soft 1.8s infinite' }}>▾</p>
        </a>
      </div>
    </section>
  );
}
