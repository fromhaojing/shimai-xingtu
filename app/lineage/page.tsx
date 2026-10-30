import type { Metadata } from 'next';
import { SiteHeader } from '../../components/site-header';
import { SiteFooter } from '../../components/site-footer';
import LineageExplorer from '../../components/lineage-explorer';
import { allEntries, catalogue } from '../../lib/catalog';
import { lineages } from '../../lib/lineages';

export const metadata: Metadata = { title: '传承图谱', description: '沿着朝代与学脉逐代浏览帝王世系、受教关系和思想回应，查看每条关系的资料出处。' };

export default function LineagePage() {
  return <><SiteHeader counts={{ ...catalogue.counts, all: allEntries.length }} activeGroup="lineage" /><main id="main" tabIndex={-1}><LineageExplorer lineages={lineages} entries={catalogue.records} /></main><SiteFooter /></>;
}
