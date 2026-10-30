'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { entrySlug } from '../lib/entry-slug';
import { sourceUrl } from '../lib/text';
import type { Entry } from '../lib/types';
import styles from './lineage-explorer.module.css';

export type RelationType = 'succession' | 'parent' | 'adoptive' | 'sibling' | 'uncle' | 'grandparent' | 'cousin' | 'influence' | 'response' | 'teacher';

export interface LineageEdge {
  from: string;
  to: string;
  type: RelationType;
  label: string;
  evidencePath: string;
  note?: string;
}

export interface LineageStage {
  id: string;
  label: string;
  nodes: string[];
}

export interface LineageGroup {
  id: string;
  label: string;
  description: string;
  stages: LineageStage[];
  edges: LineageEdge[];
}

export interface LineageCollection {
  dynasties: LineageGroup[];
  schools: LineageGroup[];
}

export type Lineages = LineageCollection;

interface Props {
  lineages: LineageCollection;
  entries: Entry[];
}

type Mode = keyof Lineages;

const relationLabels: Record<RelationType, string> = {
  succession: '继位',
  parent: '亲子',
  adoptive: '收养',
  sibling: '兄弟',
  uncle: '叔侄',
  grandparent: '祖孙',
  cousin: '堂亲',
  influence: '影响',
  response: '回应',
  teacher: '受教',
};

const modeCopy: Record<Mode, { label: string; eyebrow: string; description: string; unit: string }> = {
  dynasties: {
    label: '帝王世系',
    eyebrow: 'RULERS / 帝王',
    description: '按朝代与时期浏览帝王资料，辨认有依据的继位和亲属关系。',
    unit: '位帝王',
  },
  schools: {
    label: '思想传承',
    eyebrow: 'IDEAS / 思想',
    description: '以典籍为节点，分别观察受教、影响与观点回应。',
    unit: '部典籍',
  },
};

function relationGlyph(type: RelationType): string {
  return type === 'sibling' || type === 'cousin' ? '↔' : '→';
}

function relatedEntries(id: string, edges: LineageEdge[]): Set<string> {
  const related = new Set<string>();
  edges.forEach(edge => {
    if (edge.from === id) related.add(edge.to);
    if (edge.to === id) related.add(edge.from);
  });
  return related;
}

function RelationshipDetail({
  entry,
  edges,
  entryById,
  variant,
}: {
  entry: Entry;
  edges: LineageEdge[];
  entryById: Map<string, Entry>;
  variant: 'desktop' | 'inline';
}) {
  const relationships = edges.filter(edge => edge.from === entry.id || edge.to === entry.id);
  const headingId = variant === 'desktop' ? 'lineage-detail-heading' : 'lineage-inline-heading';

  return <section className={variant === 'desktop' ? styles.detail : styles.inlineDetail} aria-labelledby={headingId}>
    <p className={styles.detailEyebrow}>SELECTED RECORD / 当前条目</p>
    <div className={styles.detailTitleRow}>
      <span className={styles.detailMonogram} aria-hidden="true">{entry.title.slice(0, 1)}</span>
      <div>
        <h2 id={headingId}>{entry.title}</h2>
        {entry.subtitle && entry.subtitle !== entry.title && <p>{entry.subtitle}</p>}
      </div>
    </div>
    <p className={styles.detailPeriod}>{entry.period}</p>
    <p className={styles.detailDescription}>{entry.description}</p>
    <Link className={styles.detailLink} href={`/entry/${entrySlug(entry)}/`}>阅读完整资料 <span aria-hidden="true">↗</span></Link>

    <div className={styles.relationshipHeading}>
      <h3>可核对的关联</h3>
      <span>{relationships.length.toString().padStart(2, '0')}</span>
    </div>
    {relationships.length ? <ul className={styles.relationshipList}>
      {relationships.map((edge, index) => {
        const other = entryById.get(edge.from === entry.id ? edge.to : edge.from);
        if (!other) return null;
        return <li key={`${edge.from}-${edge.to}-${index}`}>
          <div className={styles.relationshipMeta}>
            <span className={styles.typeBadge} data-type={edge.type}>{relationLabels[edge.type]}</span>
            <strong>{other.title}</strong>
            {other.subgroup !== entry.subgroup && <small>{other.subgroup}</small>}
          </div>
          <p>{edge.label}</p>
          {edge.note && <p className={styles.relationNote}>{edge.note}</p>}
          {edge.evidencePath && <a href={sourceUrl(edge.evidencePath)} target="_blank" rel="noopener noreferrer">查看原始数据依据 <span aria-hidden="true">↗</span></a>}
        </li>;
      })}
    </ul> : <p className={styles.noRelationships}>原始数据中暂无可核对的直接关联；此条目仍按时期收录在图中。</p>}
  </section>;
}

export default function LineageExplorer({ lineages, entries }: Props) {
  const [mode, setMode] = useState<Mode>('dynasties');
  const [selectedGroups, setSelectedGroups] = useState<Record<Mode, string>>({
    dynasties: lineages.dynasties[0]?.id ?? '',
    schools: lineages.schools[0]?.id ?? '',
  });
  const [selectedId, setSelectedId] = useState('');
  const entryById = useMemo(() => new Map(entries.map(entry => [entry.id, entry])), [entries]);
  const allEdges = useMemo(() => {
    const seen = new Set<string>();
    return [...lineages.dynasties, ...lineages.schools].flatMap(item => item.edges).filter(edge => {
      const key = [edge.from, edge.to, edge.type, edge.label, edge.evidencePath].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [lineages]);
  const groups = lineages[mode];
  const group = groups.find(item => item.id === selectedGroups[mode]) ?? groups[0];
  const orderedIds = group ? [...new Set(group.stages.flatMap(stage => stage.nodes))].filter(id => entryById.has(id)) : [];
  const idSet = new Set(orderedIds);
  const edges = group?.edges.filter(edge => entryById.has(edge.from) && entryById.has(edge.to) && (idSet.has(edge.from) || idSet.has(edge.to))) ?? [];
  const currentId = idSet.has(selectedId) ? selectedId : orderedIds[0];
  const currentEntry = currentId ? entryById.get(currentId) : undefined;
  const currentIndex = currentId ? orderedIds.indexOf(currentId) : -1;
  const highlightedIds = currentId ? relatedEntries(currentId, edges) : new Set<string>();
  const usedTypes = [...new Set(edges.map(edge => edge.type))];

  const chooseMode = (next: Mode) => {
    setMode(next);
    setSelectedId('');
  };

  const chooseGroup = (id: string) => {
    setSelectedGroups(previous => ({ ...previous, [mode]: id }));
    setSelectedId('');
  };

  return <div className={styles.page}>
    <header className={styles.hero}>
      <div>
        <p className="eyebrow">CONNECTIONS / 知识族谱</p>
        <h1>一代一代，读懂历史的来路</h1>
        <p className={styles.heroIntro}>从帝王的承接到典籍的对话，沿时间查看每条有据可查的关联。</p>
      </div>
      <div className={styles.heroMark} aria-hidden="true"><span>世</span><span>系</span></div>
    </header>

    <div className={styles.modeBar} role="group" aria-label="选择族谱类型">
      {(['dynasties', 'schools'] as const).map((item, index) => <button key={item} type="button" className={`${styles.modeButton} ${mode === item ? styles.modeActive : ''}`} aria-pressed={mode === item} onClick={() => chooseMode(item)}>
        <span className={styles.modeIndex}>0{index + 1}</span>
        <span>{modeCopy[item].label}</span>
        <small>{item === 'dynasties' ? 'DYNASTIES' : 'SCHOOLS'}</small>
      </button>)}
    </div>

    <div className={styles.body}>
      <nav className={styles.groupNav} aria-label={mode === 'dynasties' ? '选择朝代' : '选择思想类别'}>
        <div className={styles.navHeading}>
          <p className="eyebrow">BROWSE / 浏览</p>
          <h2>{mode === 'dynasties' ? '朝代目录' : '思想目录'}</h2>
        </div>
        <div className={styles.groupButtons}>
          {groups.map(item => {
            const count = new Set(item.stages.flatMap(stage => stage.nodes)).size;
            return <button key={item.id} type="button" className={`${styles.groupButton} ${group?.id === item.id ? styles.groupActive : ''}`} aria-pressed={group?.id === item.id} onClick={() => chooseGroup(item.id)}>
              <span>{item.label}</span><small>{count}</small>
            </button>;
          })}
        </div>
        <p className={styles.navNote}>{modeCopy[mode].description}</p>
      </nav>

      <section className={styles.chart} aria-label={group ? `${group.label}${modeCopy[mode].label}` : '知识族谱'}>
        {group ? <>
          <div className={styles.chartHeading}>
            <div><p className="eyebrow">{modeCopy[mode].eyebrow}</p><h2>{group.label}<span>{modeCopy[mode].label}</span></h2></div>
            <p className={styles.chartCount}><strong>{orderedIds.length}</strong><span>{modeCopy[mode].unit}<br />{edges.length} 条有据关联</span></p>
          </div>
          <p className={styles.groupDescription}>{group.description}</p>
          <div className={styles.readingNote}><span aria-hidden="true">※</span><p>纵向排列只表示时间与资料编排。仅有标记且附依据的线表示关系；继位、亲属、受教、影响与回应各有不同含义。相邻条目不一定有血缘或直接受教关系，观点回应也不等于学说承续。</p></div>

          <div className={styles.legend} aria-label="本组关系类型">
            <strong>关系标记</strong>
            {usedTypes.length ? usedTypes.map(type => <span key={type} className={styles.typeBadge} data-type={type}>{relationLabels[type]}</span>) : <span className={styles.legendEmpty}>本组暂无明确关联</span>}
          </div>

          <ol className={styles.stages} aria-label={`${group.label}按时期排列的条目`}>
            {group.stages.map(stage => {
              const stageEntries = stage.nodes.map(id => entryById.get(id)).filter((entry): entry is Entry => Boolean(entry));
              const stageEdges = edges.filter(edge => stage.nodes.includes(idSet.has(edge.from) ? edge.from : edge.to));
              if (!stageEntries.length) return null;
              return <li className={styles.stage} key={stage.id}>
                <div className={styles.stageHeading}><span className={styles.stageDot} aria-hidden="true" /><h3>{stage.label}</h3><small>{stageEntries.length} 条资料</small></div>
                <ul className={styles.nodeList}>
                  {stageEntries.map(entry => <li className={`${styles.node} ${currentId === entry.id ? styles.nodeSelected : ''} ${highlightedIds.has(entry.id) ? styles.nodeRelated : ''}`} key={entry.id}>
                    <button type="button" className={styles.nodeButton} aria-pressed={currentId === entry.id} onClick={() => setSelectedId(entry.id)} aria-label={`${entry.title}${entry.subtitle && entry.subtitle !== entry.title ? `，${entry.subtitle}` : ''}，查看关联`}>
                      <span className={styles.nodeTop}><span>{entry.period}</span><span>{currentId === entry.id ? '正在查看' : '查看关联'}</span></span>
                      <span className={styles.nodeName}><span className={styles.nodeSeal} aria-hidden="true">{entry.title.slice(0, 1)}</span><span><strong>{entry.title}</strong>{entry.subtitle && entry.subtitle !== entry.title && <small>{entry.subtitle}</small>}</span></span>
                    </button>
                    <Link className={styles.nodeLink} href={`/entry/${entrySlug(entry)}/`}>阅读资料 <span aria-hidden="true">↗</span></Link>
                    {currentId === entry.id && <RelationshipDetail entry={entry} edges={allEdges} entryById={entryById} variant="inline" />}
                  </li>)}
                </ul>
                {stageEdges.length > 0 && <ul className={styles.edgeList} aria-label={`${stage.label}的有据关联`}>
                  {stageEdges.map((edge, index) => <li key={`${edge.from}-${edge.to}-${index}`} className={currentId === edge.from || currentId === edge.to ? styles.edgeHighlighted : ''}>
                    <span className={styles.typeBadge} data-type={edge.type}>{relationLabels[edge.type]}</span>
                    <span>{entryById.get(edge.from)?.title} <b aria-hidden="true">{relationGlyph(edge.type)}</b> {entryById.get(edge.to)?.title}</span>
                    <small>{edge.label}</small>
                    {(!idSet.has(edge.from) || !idSet.has(edge.to)) && <small className={styles.crossGroup}>跨类别</small>}
                  </li>)}
                </ul>}
              </li>;
            })}
          </ol>
        </> : <p className={styles.empty}>暂无可浏览的族谱资料。</p>}
      </section>

      <aside className={styles.inspector} aria-label="当前条目的关联资料">
        {currentEntry && <>
          <div className={styles.sequence}>
            <span>按序浏览 <strong>{currentIndex + 1}</strong> / {orderedIds.length}</span>
            <div><button type="button" disabled={currentIndex <= 0} onClick={() => setSelectedId(orderedIds[currentIndex - 1])} aria-label="上一条资料">←</button><button type="button" disabled={currentIndex >= orderedIds.length - 1} onClick={() => setSelectedId(orderedIds[currentIndex + 1])} aria-label="下一条资料">→</button></div>
          </div>
          <RelationshipDetail entry={currentEntry} edges={allEdges} entryById={entryById} variant="desktop" />
        </>}
      </aside>
    </div>
  </div>;
}
