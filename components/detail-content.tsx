import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from './icons';
import { CopyLinkButton } from './copy-link-button';
import { assetUrl } from '../lib/paths';
import { groupInfo } from '../lib/presentation';
import { cleanText, sourceUrl } from '../lib/text';
import type { ChapterItem, DetailData, Entry, GoldenItem, PersonItem, TimelineItem, ViewpointItem } from '../lib/types';

interface Section { id: string; label: string; title: string; content: ReactNode }

function Text({ value, lead = false, className = '' }: { value?: unknown; lead?: boolean; className?: string }) {
  const text = cleanText(value);
  return text ? <p className={`${lead ? 'article-lead ' : ''}${className}`.trim()}>{text}</p> : null;
}

function Timeline({ items }: { items?: TimelineItem[] }) {
  if (!items?.length) return null;
  return <ol className="timeline">{items.map((item, index) => <li key={`${item.date ?? item.year ?? index}-${index}`}><time>{cleanText(item.date ?? item.year ?? item.time)}</time><div><h3>{cleanText(item.title ?? item.event ?? item.name ?? '历史节点')}</h3><Text value={item.description ?? item.note ?? item.summary} /></div></li>)}</ol>;
}

function People({ items }: { items?: Array<PersonItem | string> }) {
  if (!items?.length) return null;
  return <div className="person-grid">{items.map((item, index) => typeof item === 'string' ? <div className="person-card" key={index}><strong>{cleanText(item)}</strong></div> : <div className="person-card" key={`${item.name ?? item.title ?? index}-${index}`}><strong>{cleanText(item.name ?? item.title ?? '人物')}</strong>{item.role && <small>{cleanText(item.role)}</small>}<Text value={item.note ?? item.description} /></div>)}</div>;
}

function Viewpoints({ items }: { items?: ViewpointItem[] }) {
  if (!items?.length) return null;
  return <>{items.map((item, index) => <div className="viewpoint" key={index}><strong>{cleanText(item.question ?? '值得追问')}</strong><Text value={item.context} />{item.viewpoints?.map((point, pointIndex) => <p key={pointIndex}><b>{String(pointIndex + 1).padStart(2, '0')}</b> {cleanText(typeof point === 'string' ? point : point.text ?? point.view)}</p>)}</div>)}</>;
}

function Chapters({ items }: { items?: ChapterItem[] }) {
  if (!items?.length) return null;
  return <>{items.map((chapter, index) => <details className="chapter" key={index} open={index === 0}><summary>{cleanText(chapter.title ?? `选读 ${index + 1}`)}</summary><div className="chapter-inner"><Text value={chapter.context} className="chapter-context" /><div className="text-pair"><div><small>原文</small><p className="original">{cleanText(chapter.original) || '暂无原文'}</p></div><div><small>今译</small><p className="gloss">{cleanText(chapter.gloss) || '暂无今译'}</p></div></div><Text value={chapter.afterword} /></div></details>)}</>;
}

function Golden({ items }: { items?: GoldenItem[] }) {
  if (!items?.length) return null;
  return <div className="golden-grid">{items.map((item, index) => <div className="golden-card" key={index}><blockquote>{cleanText(item.text ?? item.quote)}</blockquote>{item.source && <cite>{cleanText(item.source)}</cite>}<Text value={item.explain ?? item.note} /></div>)}</div>;
}

function Facts({ items }: { items?: DetailData['funFacts'] }) {
  if (!items?.length) return null;
  return <ul className="fact-list">{items.map((item, index) => <li key={index}>{cleanText(typeof item === 'string' ? item : item.fact ?? item.text ?? item.note)}</li>)}</ul>;
}

function section(id: string, label: string, title: string, content: ReactNode): Section { return { id, label, title, content }; }

function buildSections(entry: Entry, data: DetailData, sourceNames: string[]): Section[] {
  const result: Section[] = [];
  if (entry.group === 'case') {
    result.push(section('overview', '01 / OVERVIEW', '案卷概览', <><Text value={data.summary ?? entry.description} lead /><Text value={data.nameOrigin} /></>));
    if (data.background || data.process) result.push(section('process', '02 / CONTEXT', '背景与经过', <>{data.background && <div className="case-block"><h3>时代背景</h3><Text value={data.background} /></div>}{data.process && <div className="case-block"><h3>事件经过</h3><Text value={data.process} /></div>}</>));
    if (data.people?.length) result.push(section('people', '03 / PEOPLE', '相关人物', <People items={data.people} />));
    if (data.result || data.impact) result.push(section('outcome', '04 / OUTCOME', '结果与影响', <>{data.result && <div className="case-block"><h3>结果</h3><Text value={data.result} /></div>}{data.impact && <div className="case-block"><h3>影响</h3><Text value={data.impact} /></div>}</>));
    if (data.openQuestions?.length) result.push(section('questions', '05 / QUESTIONS', '留下的问题', <Viewpoints items={data.openQuestions} />));
    if (sourceNames.length) result.push(section('sources', '06 / SOURCES', '资料出处', <p>{sourceNames.join(' · ')}</p>));
  } else if (entry.group === 'emperor') {
    result.push(section('overview', '01 / OVERVIEW', '一生概览', <><Text value={data.intro ?? entry.description} lead /><Text value={data.summary} /></>));
    if (data.timeline?.length) result.push(section('timeline', '02 / TIMELINE', '生平节点', <Timeline items={data.timeline} />));
    if (data.people?.length) result.push(section('people', '03 / PEOPLE', '身边的人', <People items={data.people} />));
    if (data.majorEvents?.length) result.push(section('events', '04 / EVENTS', '重要事件', <div className="event-tags">{data.majorEvents.map((item, index) => <span className="event-tag" key={index}>{cleanText(typeof item === 'string' ? item : item.name ?? item.title)}</span>)}</div>));
    if (data.controversies?.length) result.push(section('debate', '05 / DEBATE', '争议与观察', <Viewpoints items={data.controversies} />));
    if (data.funFacts?.length) result.push(section('facts', '06 / NOTES', '补充笔记', <Facts items={data.funFacts} />));
  } else {
    result.push(section('overview', '01 / OVERVIEW', '读这条资料', <><Text value={data.intro ?? entry.description} lead /><Text value={data.core} />{data.quote && <blockquote className="article-quote">{cleanText(data.quote)}</blockquote>}</>));
    if (data.chapters?.length) result.push(section('chapters', '02 / READINGS', '原文与今译', <Chapters items={data.chapters} />));
    if (data.golden?.length) result.push(section('golden', '03 / EXCERPTS', '值得再读的句子', <Golden items={data.golden} />));
    if (data.timeline?.length) result.push(section('timeline', '04 / TIMELINE', '相关年表', <Timeline items={data.timeline} />));
    if (data.funFacts?.length) result.push(section('facts', '05 / NOTES', '补充笔记', <Facts items={data.funFacts} />));
  }
  return result;
}

export function DetailContent({ entry, data, sourceNames }: { entry: Entry; data: DetailData; sourceNames: string[] }) {
  const sections = buildSections(entry, data, sourceNames);
  const originalPath = entry.group === 'case' ? entry.sourcePath : entry.detailPath;

  return <main id="main" tabIndex={-1} className="detail-page">
    <div className="detail-toolbar"><Link className="back-button" href={`/?group=${entry.group}`}><Icon name="back" /> 返回资料馆</Link><CopyLinkButton /></div>
    <header className="detail-hero"><div className="detail-hero-copy"><span className="eyebrow">{groupInfo[entry.group].label} / {entry.subgroup} / {entry.period}</span><h1 id="detailTitle">{entry.title}</h1>{entry.subtitle && entry.subtitle !== entry.title && <p className="detail-hero-subtitle">{entry.subtitle}</p>}<p className="detail-hero-intro">{entry.description}</p></div><div className="detail-hero-visual"><span className="feature-glyph" aria-hidden="true">{entry.title.slice(0, 1)}</span>{entry.portrait && <><Image src={assetUrl(entry.portrait)} alt={`${entry.title}的 AI 生成示意图`} fill unoptimized sizes="(max-width: 640px) 100vw, 40vw" priority /><span className="image-caveat">AI 生成示意图</span></>}</div></header>
    <div className="detail-layout"><nav className="detail-toc" aria-label="本页目录"><p>CONTENTS / 目录</p>{sections.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}<a href="#data-credit">数据来源</a></nav><article className="detail-article">{sections.map(item => <section className="article-section" id={item.id} key={item.id}><span className="article-label">{item.label}</span><h2>{item.title}</h2>{item.content}</section>)}<section className="article-section" id="data-credit"><span className="article-label">SOURCE / 资料</span><h2>数据来源</h2><p className="source-note">本页文字沿用并重新排版自中华历史图谱；资料中的观点与示意图请结合原始史料阅读。</p><p><a href={sourceUrl(originalPath)} target="_blank" rel="noopener noreferrer">查看原始数据文件 ↗</a></p>{entry.portrait && <p className="source-note">配图由原项目生成，仅作视觉示意，不是真实历史肖像或文物照片。</p>}</section></article></div>
  </main>;
}
