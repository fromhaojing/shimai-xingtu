'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import type { DemoEdge, DemoGraph, DemoGroup, DemoNode, DemoRelationType } from '../lib/graph-types';
import { assetUrl } from '../lib/paths';
import { searchable, sourceUrl } from '../lib/text';
import styles from './graph-experience.module.css';

const GraphScene = dynamic(() => import('./graph-scene'), {
  ssr: false,
  loading: () => <div className={styles.sceneLoading} role="status">正在展开历史星图…</div>,
});

type Focus = DemoGroup | 'all';

const groupNames: Record<DemoGroup, string> = {
  qing: '后金—清世系',
  lixue: '理学心学',
};

const relationNames: Record<DemoRelationType, string> = {
  succession: '继位',
  parent: '亲子',
  adoptive: '收养',
  sibling: '兄弟',
  uncle: '叔侄',
  grandparent: '祖孙',
  cousin: '堂亲',
  teacher: '受教',
  influence: '影响',
  response: '观点回应',
};

const kinship = new Set<DemoRelationType>(['parent', 'adoptive', 'sibling', 'uncle', 'grandparent', 'cousin']);

function relationClass(type: DemoRelationType) {
  if (type === 'succession') return styles.succession;
  if (kinship.has(type)) return styles.kinship;
  if (type === 'response') return styles.response;
  return styles.influence;
}

function byOrder(a: DemoNode, b: DemoNode) {
  return a.order - b.order;
}

export default function GraphExperience({ graph }: { graph: DemoGraph }) {
  const [activeGroup, setActiveGroup] = useState<Focus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<DemoEdge | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const nodesById = useMemo(() => new Map(graph.nodes.map(node => [node.id, node])), [graph.nodes]);
  const selected = selectedId ? nodesById.get(selectedId) ?? null : null;
  const hovered = hoveredId ? nodesById.get(hoveredId) ?? null : null;
  const qingNodes = useMemo(() => graph.nodes.filter(node => node.group === 'qing').sort(byOrder), [graph.nodes]);
  const lixueNodes = useMemo(() => graph.nodes.filter(node => node.group === 'lixue').sort(byOrder), [graph.nodes]);
  const sequence = activeGroup === 'qing' ? qingNodes : activeGroup === 'lixue' ? lixueNodes : [];
  const sequenceIndex = selected ? sequence.findIndex(node => node.id === selected.id) : -1;
  const connected = selected ? graph.edges.filter(edge => edge.from === selected.id || edge.to === selected.id) : [];
  const normalizedQuery = searchable(query);
  const matches = normalizedQuery
    ? graph.nodes.filter(node => searchable([node.title, node.subtitle, node.period, node.description].join(' ')).includes(normalizedQuery)).slice(0, 8)
    : [];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const element = document.activeElement as HTMLElement | null;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && element?.tagName !== 'INPUT' && element?.tagName !== 'TEXTAREA' && !element?.isContentEditable) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setFocusOpen(false);
        setDirectoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const selectNode = (id: string) => {
    const node = nodesById.get(id);
    if (!node) return;
    setActiveGroup(node.group);
    setSelectedId(id);
    setActiveEdge(null);
    setHoveredId(null);
    setQuery('');
    setSearchOpen(false);
    setFocusOpen(false);
    setDirectoryOpen(false);
    setSheetExpanded(true);
    searchRef.current?.blur();
  };

  const chooseFocus = (focus: Focus) => {
    setActiveGroup(focus);
    setSelectedId(null);
    setActiveEdge(null);
    setHoveredId(null);
    setFocusOpen(false);
    setDirectoryOpen(false);
    setSheetExpanded(false);
  };

  const selectSequenceIndex = (index: number) => {
    const node = sequence[index];
    if (node) selectNode(node.id);
  };

  const focusLabel = activeGroup === 'all' ? '全景' : groupNames[activeGroup];
  const title = selected ? selected.title : activeGroup === 'all' ? '循线索，看见历史的关联' : groupNames[activeGroup];
  const panelIntro = activeGroup === 'qing'
    ? '沿后金至清代馆藏君主的顺序探索，点击节点查看继位与亲属关系。'
    : activeGroup === 'lixue'
      ? '从周敦颐到王阳明，辨认受教、影响与观点回应。'
      : '拖动场景，选择一颗节点；历史资料会在这里展开。';

  return <main id="main" className={styles.experience} data-sheet-expanded={sheetExpanded ? 'true' : 'false'}>
    <div className={styles.scene} aria-label="可旋转缩放的三维历史关系图">
      <GraphScene graph={graph} selectedId={selectedId} activeGroup={activeGroup} onSelect={selectNode} onHover={setHoveredId} onSelectEdge={edge => { selectNode(edge.to); setActiveEdge(edge); }} reducedMotion={reducedMotion} />
    </div>
    <div className={styles.atmosphere} aria-hidden="true" />

    <header className={styles.header}>
      <div className={styles.brandArea}>
        <Link className={styles.brand} href="/" aria-label="史脉星图资料馆首页">
          <span className={styles.brandSeal} aria-hidden="true">史脉<br />星图</span>
          <span className={styles.brandName}><strong>史脉星图</strong><small>HISTORY CONSTELLATION</small></span>
        </Link>
        <span className={styles.prototypeBadge}>3D 样机</span>
      </div>

      <div className={styles.searchArea}>
        <label className={styles.searchBox} htmlFor="graph-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          <input
            ref={searchRef}
            id="graph-search"
            type="search"
            value={query}
            autoComplete="off"
            onChange={event => { setQuery(event.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={event => {
              if (event.key === 'Enter' && matches[0]) { event.preventDefault(); selectNode(matches[0].id); }
              if (event.key === 'Escape') { setQuery(''); setSearchOpen(false); event.currentTarget.blur(); }
            }}
            placeholder="搜索帝王、思想、典籍"
            aria-label="搜索图谱节点"
            aria-controls="graph-search-results"
            aria-expanded={searchOpen && matches.length > 0}
          />
          <kbd aria-hidden="true">/</kbd>
        </label>
        {searchOpen && normalizedQuery && <div id="graph-search-results" className={styles.searchResults} role="listbox" aria-label="搜索结果">
          {matches.length ? matches.map(node => <button key={node.id} type="button" role="option" aria-selected={false} onClick={() => selectNode(node.id)}>
            <span className={styles.resultGlyph} data-group={node.group} aria-hidden="true">{node.title.slice(0, 1)}</span>
            <span><strong>{node.title}</strong><small>{node.subtitle} · {groupNames[node.group]}</small></span>
            <span aria-hidden="true">↗</span>
          </button>) : <p>没有找到相符的节点。</p>}
        </div>}
      </div>

      <Link className={styles.archiveLink} href="/">返回资料馆 <span aria-hidden="true">↗</span></Link>
    </header>

    <div className={styles.kicker} aria-hidden="true"><span>FIELD NOTES</span><b>01 / 3D RELATIONS</b></div>

    <section className={styles.focusControl} aria-label="图谱焦点">
      <p className={styles.controlEyebrow}>OBSERVATION / 观测范围</p>
      <button className={styles.focusTrigger} type="button" aria-expanded={focusOpen} aria-controls="graph-focus-menu" onClick={() => { setFocusOpen(value => !value); setDirectoryOpen(false); }}>
        <span className={styles.focusGlyph} aria-hidden="true">⌾</span>
        <span><small>当前焦点</small><strong>{focusLabel}</strong></span>
        <span className={styles.chevron} aria-hidden="true">⌄</span>
      </button>
      {focusOpen && <div className={styles.focusMenu} id="graph-focus-menu">
        <button type="button" data-active={activeGroup === 'all'} onClick={() => chooseFocus('all')}><span>全景</span><small>两片知识星群</small></button>
        <button type="button" data-active={activeGroup === 'qing'} onClick={() => chooseFocus('qing')}><span>后金—清世系</span><small>12 位馆藏君主</small></button>
        <button type="button" data-active={activeGroup === 'lixue'} onClick={() => chooseFocus('lixue')}><span>理学心学</span><small>6 部思想典籍</small></button>
      </div>}
      <button type="button" className={styles.directoryTrigger} aria-expanded={directoryOpen} aria-controls="graph-directory" onClick={() => { setDirectoryOpen(value => !value); setFocusOpen(false); }}>节点目录 <span>{graph.nodes.length}</span> <span aria-hidden="true">↗</span></button>
    </section>

    {directoryOpen && <section className={styles.directory} id="graph-directory" aria-label="可键盘操作的节点目录">
      <div className={styles.directoryHeading}><div><small>DIRECTORY / 节点目录</small><h2>沿名字进入图谱</h2></div><button type="button" onClick={() => setDirectoryOpen(false)} aria-label="关闭节点目录">×</button></div>
      <div className={styles.directoryGroups}>
        {([['qing', qingNodes], ['lixue', lixueNodes]] as const).map(([group, nodes]) => <div key={group}>
          <h3>{groupNames[group]} <span>{nodes.length}</span></h3>
          {nodes.map(node => <button type="button" key={node.id} onClick={() => selectNode(node.id)}><span>{node.title}</span><small>{node.subtitle}</small><span aria-hidden="true">↗</span></button>)}
        </div>)}
      </div>
    </section>}

    <details className={styles.legend}>
      <summary>关系图例 <span aria-hidden="true">⌄</span></summary>
      <div>
        <p><i className={styles.legendSuccession} aria-hidden="true" />继位</p>
        <p><i className={styles.legendKinship} aria-hidden="true" />亲属</p>
        <p><i className={styles.legendInfluence} aria-hidden="true" />受教 / 影响</p>
        <p><i className={styles.legendResponse} aria-hidden="true" />观点回应</p>
      </div>
      <small>每条实线或虚线都有资料出处。</small>
    </details>

    <p className={styles.hoverLabel} aria-live="polite">{hovered ? hovered.title + ' · 点击聚焦' : ''}</p>

    <aside className={styles.inspector} data-expanded={sheetExpanded ? 'true' : 'false'} aria-label="当前节点资料">
      <div className={styles.sheetHandle}>
        <button type="button" aria-expanded={sheetExpanded} onClick={() => setSheetExpanded(value => !value)}>
          <span className={styles.handleBar} aria-hidden="true" />
          <span>{selected ? selected.title : '从一个节点开始'}</span>
          <span aria-hidden="true">{sheetExpanded ? '⌄' : '⌃'}</span>
        </button>
      </div>
      <div className={styles.panelBody}>
        {selected ? <>
          <div className={styles.panelTopline}><span>{groupNames[selected.group]} / {selected.stageLabel}</span><button type="button" onClick={() => { setSelectedId(null); setSheetExpanded(false); }} aria-label="取消节点聚焦">×</button></div>
          {activeEdge && <div className={styles.edgeSpotlight}><span>SELECTED LINK / 关系边</span><strong>{nodesById.get(activeEdge.from)?.title} → {nodesById.get(activeEdge.to)?.title}</strong><p>{relationNames[activeEdge.type]} · {activeEdge.label}</p>{activeEdge.note && <small>{activeEdge.note}</small>}<a href={sourceUrl(activeEdge.evidencePath)} target="_blank" rel="noopener noreferrer">查看原始数据依据 ↗</a></div>}
          <div className={styles.personHeading}>
            {selected.portrait ? <Image src={assetUrl(selected.portrait)} alt={selected.title + '的 AI 生成示意图'} width={82} height={82} unoptimized /> : <span className={styles.portraitFallback} aria-hidden="true">{selected.title.slice(0, 1)}</span>}
            <div><p>SELECTED NODE / 当前节点</p><h2>{selected.title}</h2><span>{selected.subtitle}</span></div>
          </div>
          <p className={styles.period}>{selected.period}</p>
          <p className={styles.description}>{selected.description}</p>
          <Link className={styles.readLink} href={'/entry/' + selected.id + '/'}>阅读完整资料 <span aria-hidden="true">↗</span></Link>
          <div className={styles.relationsHeading}><div><small>VERIFIED LINKS</small><h3>可核对的关联</h3></div><strong>{String(connected.length).padStart(2, '0')}</strong></div>
          {connected.length ? <ul className={styles.relationList}>
            {connected.map((edge, index) => {
              const other = nodesById.get(edge.from === selected.id ? edge.to : edge.from);
              if (!other) return null;
              return <li key={edge.from + '-' + edge.to + '-' + edge.type + '-' + index}>
                <div className={styles.relationTop}><span className={relationClass(edge.type)}>{relationNames[edge.type]}</span><button type="button" onClick={() => selectNode(other.id)}>{other.title}<span aria-hidden="true">↗</span></button></div>
                <p>{edge.label}</p>
                {edge.note && <small>{edge.note}</small>}
                <a href={sourceUrl(edge.evidencePath)} target="_blank" rel="noopener noreferrer">查看原始数据依据 <span aria-hidden="true">↗</span></a>
              </li>;
            })}
          </ul> : <p className={styles.noRelations}>这条资料暂时没有可核对的直接关联。</p>}
        </> : <>
          <div className={styles.introMark} aria-hidden="true"><span>史</span><span>脉</span></div>
          <p className={styles.introEyebrow}>EXPLORE THE ARCHIVE</p>
          <h2>{title}</h2>
          <p className={styles.introText}>{panelIntro}</p>
          <div className={styles.entryChoices}>
            <button type="button" onClick={() => selectNode(qingNodes[0].id)}><span>01</span><strong>从后金—清世系出发</strong><span aria-hidden="true">↗</span></button>
            <button type="button" onClick={() => selectNode(lixueNodes[0].id)}><span>02</span><strong>沿理学心学寻源</strong><span aria-hidden="true">↗</span></button>
          </div>
          <p className={styles.dataNote}>样机收录 18 个节点、{graph.edges.length} 条附出处的关系。节点位置用于阅读，不表示精确地理坐标。</p>
        </>}
      </div>
    </aside>

    <section className={styles.timeRail} aria-label="沿时间浏览节点">
      <div className={styles.railHeading}><span>TIME TRACE / 时间序列</span><strong>{activeGroup === 'all' ? '从节点进入一条线索' : groupNames[activeGroup]}</strong></div>
      {sequence.length ? <>
        <div className={styles.railControls}>
          <button type="button" aria-label="上一位节点" disabled={sequenceIndex <= 0} onClick={() => selectSequenceIndex(sequenceIndex - 1)}>←</button>
          <input type="range" min="0" max={String(sequence.length - 1)} step="1" value={Math.max(sequenceIndex, 0)} onChange={event => selectSequenceIndex(Number(event.target.value))} aria-label={groupNames[activeGroup as DemoGroup] + '时间序列'} aria-valuetext={selected ? selected.title + '，' + selected.period : '拖动以选择节点'} />
          <button type="button" aria-label="下一位节点" disabled={sequenceIndex >= sequence.length - 1} onClick={() => selectSequenceIndex(Math.max(sequenceIndex + 1, 0))}>→</button>
        </div>
        <div className={styles.railLabels}><span>{sequence[0].period}</span><span>{sequenceIndex >= 0 ? String(sequenceIndex + 1).padStart(2, '0') + ' / ' + String(sequence.length).padStart(2, '0') : '拖动以选择'}</span><span>{sequence[sequence.length - 1].period}</span></div>
      </> : <div className={styles.railEmpty}><span>后金—清世系</span><i aria-hidden="true" /><span>理学心学</span></div>}
    </section>

    <p className={styles.hint}>拖拽旋转 <span>·</span> 滚轮缩放 <span>·</span> 点击节点聚焦</p>
    <p className={styles.screenReaderStatus} role="status" aria-live="polite">{selected ? '当前节点：' + selected.title + '，' + connected.length + ' 条有据关联' : '当前为' + focusLabel + '视角'}</p>
  </main>;
}
