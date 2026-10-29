import type { Metadata, Viewport } from 'next';
import { assetUrl } from '../lib/paths';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '山河经纬 · 中华历史资料馆', template: '%s · 山河经纬' },
  description: '一座可检索的中华历史资料馆。沿着帝王、思想、诗词、工艺、神话与历史事件，重新阅读中国历史。',
  icons: { icon: assetUrl('favicon.svg') },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f5f3ee' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main">跳到正文</a><div className="site-shell">{children}</div></body></html>;
}
