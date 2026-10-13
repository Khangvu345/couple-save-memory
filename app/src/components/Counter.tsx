 'use client';

import { useEffect, useState } from 'react';
import type { Couple } from '@/lib/types';
import { Photo } from './Photo';

const vietnamParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function vietnamNow() {
  const parts = Object.fromEntries(vietnamParts.formatToParts(new Date())
    .filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
}

function startMoment(date: string, time?: string | null) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = (time ?? '00:00:00').split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function diffYMDHMS(fromISO: string, time: string | null | undefined, to: Date) {
  const from = startMoment(fromISO, time);
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let anchor = new Date(Date.UTC(from.getUTCFullYear() + years, from.getUTCMonth(), from.getUTCDate(), from.getUTCHours(), from.getUTCMinutes(), from.getUTCSeconds()));
  if (anchor > to) { years--; anchor = new Date(Date.UTC(from.getUTCFullYear() + years, from.getUTCMonth(), from.getUTCDate(), from.getUTCHours(), from.getUTCMinutes(), from.getUTCSeconds())); }

  let months = (to.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + to.getUTCMonth() - anchor.getUTCMonth();
  let monthAnchor = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + months, anchor.getUTCDate(), anchor.getUTCHours(), anchor.getUTCMinutes(), anchor.getUTCSeconds()));
  if (monthAnchor > to) { months--; monthAnchor = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + months, anchor.getUTCDate(), anchor.getUTCHours(), anchor.getUTCMinutes(), anchor.getUTCSeconds())); }

  let remaining = Math.max(0, Math.floor((to.getTime() - monthAnchor.getTime()) / 1000));
  const days = Math.floor(remaining / 86400); remaining %= 86400;
  const hours = Math.floor(remaining / 3600); remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return { years, months, days, hours, minutes, seconds };
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d} . ${m} . ${y}`;
};

export function Counter({ couple }: { couple: Couple }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(vietnamNow());
    const timer = window.setInterval(() => setNow(vietnamNow()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const elapsed = diffYMDHMS(couple.start_date, couple.start_time, now ?? vietnamNow());
  return (
    <section id="counter" className="cinema-surface relative overflow-hidden px-5 py-16 text-center">
      {couple.counter_photo_url && (
        <div className="absolute inset-0 z-0">
          <Photo src={couple.counter_photo_url} className="h-full w-full" label="ẢNH BỘ ĐẾM" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/75 to-ink/95" />
        </div>
      )}

      <div className="absolute left-[14%] top-[22%] z-10 h-14 w-14 rounded-full bg-gold/20 blur-xl" />
      <div className="absolute right-[16%] top-[48%] z-10 h-10 w-10 rounded-full bg-gold/15 blur-lg" />

      <div className="relative z-10">
      <p className="text-left font-mono text-[11px] tracking-[0.35em] text-smoke">BẮT ĐẦU TỪ</p>
      <p className="text-left font-serif2 mt-3 text-[26px] text-gold">{fmtDate(couple.start_date)} ♡</p>

      <p className="mt-8 text-[13px] text-smoke">Chúng ta đã bên nhau</p>
      <div className="mt-3 grid grid-cols-3 gap-x-5 gap-y-7">
        <div>
          <div className="font-number text-6xl">{pad(elapsed.years)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">NĂM</div>
        </div>
        <div>
          <div className="font-number text-6xl text-gold">{pad(elapsed.months)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">THÁNG</div>
        </div>
        <div>
          <div className="font-number text-6xl">{pad(elapsed.days)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">NGÀY</div>
        </div>
        <div>
          <div className="font-number text-5xl text-gold">{pad(elapsed.hours)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">GIỜ</div>
        </div>
        <div>
          <div className="font-number text-5xl">{pad(elapsed.minutes)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">PHÚT</div>
        </div>
        <div>
          <div className="font-number text-5xl text-gold">{pad(elapsed.seconds)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">GIÂY</div>
        </div>
      </div>
      <p className="text-right font-hand mt-4 text-[26px] text-gold">và vẫn đang tiếp tục…</p>

      <div className="paper-note relative mx-auto mt-10 max-w-[240px] -rotate-2 px-5 py-6 text-paper-ink">
        <div className="absolute -top-[11px] left-1/2 h-[22px] w-[78px] -translate-x-1/2 -rotate-3 bg-tape/70" />
        <p className="font-hand text-[21px] leading-[1.7]">
          Cảm ơn vì đã chọn ở lại.<br />Mỗi ngày có em<br />đều là một thước phim may mắn.
        </p>
      </div>
      </div>
    </section>
  );
}
