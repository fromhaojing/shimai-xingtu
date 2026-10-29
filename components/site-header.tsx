'use client';

import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from './icons';
import { groupInfo, groupOrder } from '../lib/presentation';
import type { Group } from '../lib/types';

interface Props {
  counts: Record<string, number>;
  activeGroup: Group | 'map' | 'lineage' | 'about';
  query?: string;
  onGroupChange?: (group: Group) => void;
  onSearchChange?: (query: string) => void;
}

export function SiteHeader({ counts, activeGroup, query = '', onGroupChange, onSearchChange }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(query);

  useEffect(() => { setSearch(query); }, [query]);
  useEffect(() => {
    const handleSlash = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement | null)?.tagName || '')) {
        event.preventDefault();
        document.getElementById('siteSearch')?.focus();
      }
    };
    document.addEventListener('keydown', handleSlash);
    return () => document.removeEventListener('keydown', handleSlash);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSearchChange) onSearchChange(search);
    else router.push(search.trim() ? `/?q=${encodeURIComponent(search.trim())}` : '/');
  };

  const chooseGroup = (event: MouseEvent<HTMLAnchorElement>, group: Group) => {
    if (!onGroupChange) return;
    event.preventDefault();
    onGroupChange(group);
  };

  return <>
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="山河经纬，返回资料馆首页">
          <span className="brand-mark" aria-hidden="true"><span>山河</span><span>经纬</span></span>
          <span className="brand-copy"><strong>山河经纬</strong><small>CHINA HISTORY ARCHIVE</small></span>
        </Link>
        <div className="header-tools">
          <form className="search-field" role="search" onSubmit={submit}>
            <Icon name="search" />
            <input id="siteSearch" type="search" autoComplete="off" value={search} onChange={event => { setSearch(event.target.value); onSearchChange?.(event.target.value); }} onKeyDown={event => { if (event.key === 'Escape') { setSearch(''); onSearchChange?.(''); event.currentTarget.blur(); } }} placeholder="搜索人物、典籍、事件" aria-label="搜索人物、典籍、事件" />
            <kbd aria-hidden="true">/</kbd>
          </form>
          <a className="header-source" href="https://github.com/zinging/chinese-history-atlas" target="_blank" rel="noopener noreferrer">数据原项目 <Icon name="external" /></a>
        </div>
      </div>
    </header>
    <nav className="primary-nav" aria-label="馆藏分类">
      <div className="nav-inner">
        <Link className={`nav-tab ${activeGroup === 'all' ? 'is-active' : ''}`} href="/" onClick={event => chooseGroup(event, 'all')} aria-current={activeGroup === 'all' ? 'page' : undefined}>总览 <span>{counts.all ?? '—'}</span></Link>
        <Link className={`nav-tab nav-tab-lineage ${activeGroup === 'lineage' ? 'is-active' : ''}`} href="/lineage/" aria-current={activeGroup === 'lineage' ? 'page' : undefined}><Icon name="lineage" />传承图谱</Link>
        {groupOrder.map(group => <Link key={group} className={`nav-tab ${activeGroup === group ? 'is-active' : ''}`} href={`/?group=${group}`} onClick={event => chooseGroup(event, group)} aria-current={activeGroup === group ? 'page' : undefined}>{groupInfo[group].label} <span>{counts[group] ?? '—'}</span></Link>)}
        <Link className={`nav-tab nav-tab-map ${activeGroup === 'map' ? 'is-active' : ''}`} href="/map/" aria-current={activeGroup === 'map' ? 'page' : undefined}><Icon name="map" />舆图</Link>
      </div>
    </nav>
  </>;
}
