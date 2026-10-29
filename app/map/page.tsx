import type { Metadata } from 'next';
import { SiteHeader } from '../../components/site-header';
import { SiteFooter } from '../../components/site-footer';
import MapExplorer from '../../components/map-explorer';
import { allEntries, catalogue } from '../../lib/catalog';

export const metadata: Metadata = { title: '疆域与事件', description: '通过唐、元、明、清四朝的示意疆域和事件点位，观察历史发生的空间。' };

export default function MapPage() {
  return <><SiteHeader counts={{ ...catalogue.counts, all: allEntries.length }} activeGroup="map" /><main id="main" tabIndex={-1}><MapExplorer /></main><SiteFooter /></>;
}
