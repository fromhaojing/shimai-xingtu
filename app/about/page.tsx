import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../../components/site-header';
import { SiteFooter } from '../../components/site-footer';
import { allEntries, catalogue } from '../../lib/catalog';

export const metadata: Metadata = { title: '数据与图片说明', description: '了解山河经纬的数据来源、使用许可及地图和配图的阅读提示。' };

export default function AboutPage() {
  return <><SiteHeader counts={{ ...catalogue.counts, all: allEntries.length }} activeGroup="about" /><main id="main" className="about-page" tabIndex={-1}>
    <div className="about-hero"><p className="eyebrow">ABOUT THE ARCHIVE / 关于资料</p><h1>数据与图片说明</h1><p>这是一套新的阅读界面，历史资料来自开放的「中华历史图谱」项目。这里说明我们收录了什么，以及怎样理解其中的图像与地图。</p></div>
    <div className="about-content"><aside><p>CONTENTS / 本页</p><a href="#provenance">资料来源</a><a href="#scope">收录范围</a><a href="#caveats">阅读提示</a><a href="#license">许可与致谢</a></aside><article>
      <section id="provenance"><span className="article-label">01 / PROVENANCE</span><h2>资料来源</h2><p>历史知识数据与人物配图取自 <a href="https://github.com/zinging/chinese-history-atlas" target="_blank" rel="noopener noreferrer">zinging/chinese-history-atlas</a>，固定于上游提交 <a href="https://github.com/zinging/chinese-history-atlas/commit/0a514c9449acc5d71e638d3f0791c118b1496902" target="_blank" rel="noopener noreferrer">0a514c9</a>。本网站直接读取仓库内的静态数据文件。</p></section>
      <section id="scope"><span className="article-label">02 / SCOPE</span><h2>收录范围</h2><p>资料库保留了上游 228 个正式 JSON 与 GeoJSON 文件的目录结构，收录 152 条人物与典籍主记录、76 件历史公案，以及 315 张用于目录展示的配图。生成用搜索索引、隐藏备份与大型器物、事件、神话舆图原图未收入本仓库。</p><p>首页将资料整理为帝王、思想、诗词、格物、神话和史事六条线索；传承图谱展示馆藏帝王的代际顺序与有据可查的关系，以及思想典籍的师承、影响和回应；舆图页展示具有边界数据的唐、元、明、清四朝。</p></section>
      <section id="caveats"><span className="article-label">03 / READING NOTES</span><h2>阅读提示</h2><p>人物画像及条目配图是原项目的 AI 生成示意图，并非真实的历史肖像或文物照片。唐、元、明、清疆域为手绘简化示意，不能作为精确行政边界使用。地图页保留了每份 GeoJSON 的来源说明。传承图谱中的相邻人物只表示馆藏排列顺序；只有标明关系和出处的连线才表示具体继位、亲属或思想传承。</p><p>神话内容属于原著叙事，应与真实历史地理区分。重要的历史判断请结合所列史料和学术资料核对。</p></section>
      <section id="license"><span className="article-label">04 / LICENSE</span><h2>许可与致谢</h2><p>原项目版权为 Copyright (c) 2026 chen_ye_code，以 MIT 许可证发布。完整原始许可文本保存在本仓库的 <a href="https://github.com/fromhaojing/shanhe-jingwei/blob/main/THIRD_PARTY_LICENSE" target="_blank" rel="noopener noreferrer">THIRD_PARTY_LICENSE</a>。感谢原项目开放结构化资料。</p><p><Link href="/">返回资料馆</Link> · <Link href="/lineage/">查看传承图谱</Link> · <Link href="/map/">查看历史舆图</Link></p></section>
    </article></div>
  </main><SiteFooter /></>;
}
