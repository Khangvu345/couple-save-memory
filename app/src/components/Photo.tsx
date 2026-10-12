/** Khung ảnh: hiện ảnh thật nếu có, không thì placeholder đồng tone. */
export function Photo({ src, className = '', label = 'ẢNH' }: { src?: string | null; className?: string; label?: string }) {
  if (!src) {
    return (
      <div
        className={`photo-tone flex items-center justify-center bg-gradient-to-br from-panel via-ink to-ink border border-white/10 ${className}`}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-cream/30">{label}</span>
      </div>
    );
  }
  return <img src={src} alt="" className={`photo-tone object-cover ${className}`} loading="lazy" />;
}
