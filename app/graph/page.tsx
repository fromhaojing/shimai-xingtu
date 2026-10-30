import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import GraphExperience from '../../components/graph-experience';
import type { DemoGraph } from '../../lib/graph-types';

export const metadata: Metadata = {
  title: '历史关系星图 · 3D 样机',
  description: '在 3D 节点图中探索后金—清世系和理学心学，并逐条核对继位、亲属、受教与思想影响。',
};

export default function GraphPage() {
  const graph = JSON.parse(readFileSync(path.join(process.cwd(), 'public', 'graph-demo.json'), 'utf8')) as DemoGraph;
  return <GraphExperience graph={graph} />;
}
