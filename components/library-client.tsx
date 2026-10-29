'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { Icon } from './icons';
import { assetUrl } from '../lib/paths';
import { entrySlug } from '../lib/entry-slug';
import { featuredSource, groupInfo, groupOrder } from '../lib/presentation';
import { searchable } from '../lib/text';
import type { Catalogue, Entry, Group } from '../lib/types';

function isGroup(value: string | null): value is Group {
  return value !== null && Object.prototype.hasOwnProperty.call(groupInfo, value);
}

function parseFilters(search: string) {
  const params = new URLSearchParams(search);
  return { group: isGroup(params.get('group')) ? params.get('group') as Group : 'all' as Group, subgroup: params.get('subgroup') || '', query: params.get('q') || '' };
}

function subscribeToFilters(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener('filterschange', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('filterschange', callback);
  };
}

function getFilterSnapshot() { return window.location.search; }
function getServerFilterSnapshot() { return ''; }

function writeFilters(group: Group, subgroup: string, query: string, push: boolean) {
  const url = new URL(window.location.href);
  url.search = '';
  if (group !== 'all') url.searchParams.set('group', group);
  if (subgroup) url.searchParams.set('subgroup', subgroup);
  if (query.trim()) url.searchParams.set('q', query.trim());
  window.history[push ? 'pushState' : 'replaceState']({}, '', url);
  window.dispatchEvent(new Event('filterschange'));
}

function interleave(entries: Entry[]): Entry[] {
  const buckets = groupOrder.map(group => entries.filter(entry => entry.group === group));
  const result: Entry[] = [];
  while (buckets.some(bucket => bucket.length)) buckets.forEach(bucket => { const next = bucket.shift(); if (next) result.push(next); });
  return result;
}

function filterEntries(entries: Entry[], group: Group, subgroup: string, query: string): Entry[] {
  let filtered = group === 'all' ? entries : entries.filter(entry => entry.group === group);
  if (subgroup) filtered = filtered.filter(entry => entry.subgroup === subgroup);
  const needle = searchable(query);
  if (needle) {
    return filtered.map((entry, index) => {
      const title = searchable(entry.title);
      const head = searchable([entry.subtitle, entry.period, entry.subgroup].join(' '));
      const body = searchable([entry.description, entry.group === 'case' ? [entry.body.background, entry.body.process].join(' ') : ''].join(' '));
      const score = title === needle ? 100 : title.startsWith(needle) ? 75 : title.includes(needle) ? 55 : head.includes(needle) ? 30 : body.includes(needle) ? 10 : 0;
      return { entry, index, score };
    }).filter(row => row.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).map(row => row.entry);
  }
  return group === 'all' ? interleave(filtered) : filtered;
}

function chosenFeature(entries: Entry[], group: Group, subgroup: string, query: string): Entry | null {
  if (!entries.length || subgroup || query.trim()) return null;
  const preferred = featuredSource[group];
  return entries.find(entry => preferred && entry.group === preferred[0] && entry.sourceId === preferred[1]) || entries[0];
}

function Portrait({ entry, featured = false }: { entry: Entry; featured?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <>
    <span className={featured ? 'feature-glyph' : `card-glyph ${entry.group === 'case' ? 'case' : ''}`} aria-hidden="true">{entry.title.slice(0, 1)}</span>
    {entry.portrait && !failed && <Image src={assetUrl(entry.portrait)} alt={`${entry.title}的 AI 生成示意图`} fill unoptimized sizes={featured ? '(max-width: 640px) 100vw, 38vw' : '(max-width: 640px) 100vw, (max-width: 1250px) 45vw, 27vw'} priority={featured} onError={() => setFailed(true)} />}
  </>;
}

function FeatureCard({ entry, group }: { entry: Entry; group: Group }) {
  return <article className="feature-card">
    <div className="feature-copy">
      <span className="feature-kicker">{group === 'all' ? '馆藏选读' : `${groupInfo[entry.group].label}选读`} / FEATURED RECORD</span>
      <h2>{entry.title}{entry.subtitle && entry.subtitle !== entry.title && <span className="feature-subtitle"> · {entry.subtitle}</span>}</h2>
      <p>{entry.description}</p>
      <Link className="feature-action" href={`/entry/${entrySlug(entry)}/`}>展开这条资料 <Icon name="arrow" /></Link>
    </div>
    <div className="feature-visual"><Portrait entry={entry} featured /><span className="feature-stamp" aria-hidden="true">山河经纬</span></div>
  </article>;
}

function RecordCard({ entry, index }: { entry: Entry; index: number }) {
  const label = groupInfo[entry.group].label;
  return <Link className="record-card" href={`/entry/${entrySlug(entry)}/`} aria-label={`阅读${label}：${entry.title}`}>
    <div className="card-image"><Portrait entry={entry} /><span className="card-image-index">{String(index + 1).padStart(3, '0')}</span></div>
    <div className="card-body">
      <div className="card-meta"><span className="card-kind">{label}</span><span className="card-period">{entry.period}</span></div>
      <h3>{entry.title}</h3>
      {entry.subtitle && entry.subtitle !== entry.title && <span className="card-subtitle">{entry.subtitle}</span>}
      <p className="card-description">{entry.description || '点击查看完整资料。'}</p>
      <div className="card-footer"><span>{entry.subgroup || label}</span><Icon name="arrow" /></div>
    </div>
  </Link>;
}

export default function LibraryClient({ catalogue }: { catalogue: Catalogue }) {
  const entries = useMemo<Entry[]>(() => [...catalogue.records, ...catalogue.cases], [catalogue]);
  const counts = useMemo(() => ({ ...catalogue.counts, all: entries.length }), [catalogue, entries.length]);
  const filterSearch = useSyncExternalStore(subscribeToFilters, getFilterSnapshot, getServerFilterSnapshot);
  const { group, subgroup, query } = parseFilters(filterSearch);
  const [visibleCount, setVisibleCount] = useState(24);

  const filtered = useMemo(() => filterEntries(entries, group, subgroup, query), [entries, group, subgroup, query]);
  const feature = chosenFeature(filtered, group, subgroup, query);
  const gridEntries = feature ? filtered.filter(entry => entry.id !== feature.id) : filtered;
  const visible = gridEntries.slice(0, visibleCount);
  const info = groupInfo[group];

  const chooseGroup = (next: Group) => {
    setVisibleCount(24);
    writeFilters(next, '', query, true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const chooseSubgroup = (next: string) => {
    setVisibleCount(24);
    writeFilters(group, next, query, true);
  };
  const search = (next: string) => {
    setVisibleCount(24);
    writeFilters(group, subgroup, next, false);
  };
  const clear = () => {
    setVisibleCount(24);
    writeFilters('all', '', '', true);
  };

  const subgroupCounts = new Map<string, number>();
  entries.filter(entry => entry.group === group).forEach(entry => subgroupCounts.set(entry.subgroup || '其他', (subgroupCounts.get(entry.subgroup || '其他') || 0) + 1));

  return <>
    <SiteHeader counts={counts} activeGroup={group} query={query} onGroupChange={chooseGroup} onSearchChange={search} />
    <main id="main" tabIndex={-1}>
      <section className="workspace" aria-labelledby="sectionTitle">
        <aside className="filter-sidebar" aria-label="筛选馆藏">
          <div className="filter-sticky">
            <div className="filter-heading"><span className="eyebrow">01 / BROWSE</span><h2>按线索阅读</h2></div>
            <div className="filter-block">
              <div className="filter-label-row"><span>分类与时期</span><button type="button" className="text-button" onClick={clear}>清除</button></div>
              <div className="filter-options" role="group" aria-label="分类与时期">
                {group === 'all' ? groupOrder.map(item => <button key={item} type="button" className="filter-option" onClick={() => chooseGroup(item)}><span>{groupInfo[item].label}</span><span>{counts[item]}</span></button>) : <>
                  <button type="button" className={`filter-option ${subgroup === '' ? 'is-active' : ''}`} aria-pressed={subgroup === ''} onClick={() => chooseSubgroup('')}><span>全部</span><span>{counts[group]}</span></button>
                  {[...subgroupCounts].map(([name, count]) => <button key={name} type="button" className={`filter-option ${subgroup === name ? 'is-active' : ''}`} aria-pressed={subgroup === name} onClick={() => chooseSubgroup(name)}><span>{name}</span><span>{count}</span></button>)}
                </>}
              </div>
            </div>
            <div className="sidebar-note"><div className="sidebar-note-line" aria-hidden="true" /><p>一条线索从一个名字开始，延伸到它所在的时代。</p><Link className="sidebar-map-link" href="/lineage/">进入传承图谱 <Icon name="arrow" /></Link><Link className="sidebar-map-link" href="/map/">进入历史舆图 <Icon name="arrow" /></Link></div>
          </div>
        </aside>

        <div className="library-main">
          <div className="section-heading">
            <div><p className="eyebrow">{info.eyebrow}</p><h1 id="sectionTitle">{query.trim() ? `检索「${query.trim()}」` : info.title}</h1><p className="section-description">{query.trim() ? '按标题、人物、时期与内容线索检索馆藏资料。' : info.description}</p></div>
            <div className="result-total"><span>{filtered.length}</span><small>条资料</small></div>
          </div>
          {feature && <FeatureCard entry={feature} group={group} />}
          <div className="results-bar"><div className="results-label"><span className="eyebrow">COLLECTION</span><h2>{query.trim() ? '检索结果' : group === 'all' ? '全部馆藏' : `${info.label}资料`}</h2></div><p role="status" aria-live="polite">{filtered.length ? `已展示 ${visible.length + (feature ? 1 : 0)} / ${filtered.length} 条` : '没有找到相符的资料'}</p></div>
          <div className="card-grid">{visible.length ? visible.map((entry, index) => <RecordCard key={entry.id} entry={entry} index={index} />) : <div className="empty-state"><h3>暂时没有结果</h3><p>换一个关键词，或清除筛选条件再看看。</p><button type="button" onClick={clear}>查看全部馆藏</button></div>}</div>
          {visibleCount < gridEntries.length && <div className="more-row"><button type="button" className="more-button" onClick={() => setVisibleCount(value => value + 24)}>继续浏览 <Icon name="arrow" /></button></div>}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
