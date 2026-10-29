import Link from 'next/link';

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner"><div><strong>山河经纬</strong><span>把历史放回它发生的地方。</span></div><p>资料改编自 <a href="https://github.com/zinging/chinese-history-atlas" target="_blank" rel="noopener noreferrer">中华历史图谱</a> · 原项目 MIT 许可 · <Link href="/about/">数据与图片说明</Link></p></div></footer>;
}
