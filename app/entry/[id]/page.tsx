import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader } from '../../../components/site-header';
import { SiteFooter } from '../../../components/site-footer';
import { DetailContent } from '../../../components/detail-content';
import { allEntries, catalogue, entrySlug, getDetail, getEntryBySlug, sourceById } from '../../../lib/catalog';
import { cleanText } from '../../../lib/text';

export const dynamicParams = false;

export function generateStaticParams() {
  return allEntries.map(entry => ({ id: entrySlug(entry) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const entry = getEntryBySlug(id);
  return entry ? { title: entry.title, description: cleanText(entry.description) } : { title: '资料未找到' };
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getEntryBySlug(id);
  if (!entry) notFound();
  const detail = getDetail(entry);
  const sourceNames = (detail.sources || []).map(source => sourceById.get(source)?.title || source);
  const counts = { ...catalogue.counts, all: allEntries.length };
  return <><SiteHeader counts={counts} activeGroup={entry.group} /><DetailContent entry={entry} data={detail} sourceNames={sourceNames} /><SiteFooter /></>;
}
