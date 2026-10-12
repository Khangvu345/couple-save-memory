import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Oswald, Playfair_Display, Dancing_Script, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-bebas' });
const oswald = Oswald({ weight: ['600', '700'], subsets: ['latin', 'vietnamese'], variable: '--font-oswald' });
const playfair = Playfair_Display({ style: ['normal', 'italic'], weight: ['500', '600'], subsets: ['latin', 'vietnamese'], variable: '--font-playfair' });
const dancing = Dancing_Script({ weight: ['500', '600', '700'], subsets: ['latin', 'vietnamese'], variable: '--font-dancing' });
const beVietnam = Be_Vietnam_Pro({ weight: ['400', '500', '600'], subsets: ['latin', 'vietnamese'], variable: '--font-bevietnam' });

export const metadata: Metadata = {
  title: 'Bộ phim của chúng ta',
  description: 'Nơi lưu giữ kỷ niệm của hai đứa mình.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // cho phép tràn dưới Dynamic Island, nội dung né bằng safe-area
  themeColor: '#0a0a0c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${bebas.variable} ${oswald.variable} ${playfair.variable} ${dancing.variable} ${beVietnam.variable}`}>
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
