import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Catalogue, DetailData, Entry, SourceRecord } from './types';
import { entrySlug } from './entry-slug';

const publicDir = path.join(process.cwd(), 'public');
export const catalogue = JSON.parse(readFileSync(path.join(publicDir, 'catalog.json'), 'utf8')) as Catalogue;
export const allEntries: Entry[] = [...catalogue.records, ...catalogue.cases];

export { entrySlug };

const entriesBySlug = new Map(allEntries.map(entry => [entrySlug(entry), entry]));

export function getEntryBySlug(slug: string): Entry | undefined {
  return entriesBySlug.get(slug);
}

export function getDetail(entry: Entry): DetailData {
  if (entry.group === 'case') return entry.body;
  const fullPath = path.resolve(publicDir, entry.detailPath);
  if (!fullPath.startsWith(publicDir + path.sep)) throw new Error('Invalid detail path');
  return JSON.parse(readFileSync(fullPath, 'utf8')) as DetailData;
}

export const sources: SourceRecord[] = (JSON.parse(readFileSync(path.join(publicDir, 'data', 'sources', 'sources.json'), 'utf8')) as { sources: SourceRecord[] }).sources;
export const sourceById = new Map(sources.map(source => [source.id, source]));
