import type { Couple } from '@/lib/types';

function diffYMD(fromISO: string, to: Date) {
  const from = new Date(fromISO + 'T00:00:00');
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) { m -= 1; d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (m < 0) { y -= 1; m += 12; }
  return { y, m, d };
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d} . ${m} . ${y}`;
};

export function Counter({ couple }: { couple: Couple }) {
  const { y, m, d } = diffYMD(couple.start_date, new Date());
  return (
    <section id="counter" className="relative overflow-hidden px-6 py-20 text-center">
      <div className="absolute left-[14%] top-[22%] h-14 w-14 rounded-full bg-gold/20 blur-xl" />
      <div className="absolute right-[16%] top-[48%] h-10 w-10 rounded-full bg-gold/15 blur-lg" />

      <p className="font-mono text-[11px] tracking-[0.35em] text-smoke">BẮT ĐẦU TỪ</p>
      <p className="font-serif2 mt-3 text-[26px] text-gold">{fmtDate(couple.start_date)} ♡</p>

      <p className="mt-8 text-[13px] text-smoke">Chúng ta đã bên nhau</p>
      <div className="mt-3 flex items-baseline justify-center gap-5">
        <div>
          <div className="font-display text-6xl">{pad(y)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">NĂM</div>
        </div>
        <div className="font-display text-4xl text-smoke">·</div>
        <div>
          <div className="font-display text-6xl text-gold">{pad(m)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">THÁNG</div>
        </div>
        <div className="font-display text-4xl text-smoke">·</div>
        <div>
          <div className="font-display text-6xl">{pad(d)}</div>
          <div className="font-mono mt-1 text-[9px] tracking-[0.3em] text-smoke">NGÀY</div>
        </div>
      </div>
      <p className="font-hand mt-4 text-[26px] text-gold">và vẫn đang tiếp tục…</p>

      <div className="relative mx-auto mt-10 max-w-[240px] -rotate-2 rounded-[3px] bg-[#ece1c9] px-5 py-6 text-[#2b2416] shadow-[0_10px_26px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-[11px] left-1/2 h-[22px] w-[78px] -translate-x-1/2 -rotate-3 bg-[#d2b98c]/40" />
        <p className="font-hand text-[21px] leading-[1.7]">
          Cảm ơn vì đã chọn ở lại.<br />Mỗi ngày có em<br />đều là một thước phim may mắn.
        </p>
      </div>
    </section>
  );
}
