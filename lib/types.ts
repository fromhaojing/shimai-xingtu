export type Group = 'all' | 'emperor' | 'thought' | 'poetry' | 'craft' | 'myth' | 'case';
export type RecordGroup = Exclude<Group, 'all' | 'case'>;

export interface BaseEntry {
  id: string;
  group: Exclude<Group, 'all'>;
  title: string;
  subtitle: string;
  period: string;
  description: string;
  portrait: string | null;
  detailPath: string | null;
  sourceId: string;
  subgroup: string;
}

export interface RecordEntry extends BaseEntry {
  group: RecordGroup;
  detailPath: string;
}

export interface CaseEntry extends BaseEntry {
  group: 'case';
  detailPath: null;
  sourcePath: string;
  body: DetailData;
}

export type Entry = RecordEntry | CaseEntry;

export interface Catalogue {
  counts: Record<Exclude<Group, 'all'> | 'records', number>;
  records: RecordEntry[];
  cases: CaseEntry[];
}

export interface TimelineItem {
  date?: string | number;
  year?: string | number;
  time?: string | number;
  title?: string;
  event?: string;
  name?: string;
  description?: string;
  note?: string;
  summary?: string;
}

export interface PersonItem {
  name?: string;
  title?: string;
  role?: string;
  note?: string;
  description?: string;
}

export interface ViewpointItem {
  question?: string;
  context?: string;
  viewpoints?: Array<string | { text?: string; view?: string }>;
}

export interface ChapterItem {
  title?: string;
  original?: string;
  gloss?: string;
  context?: string;
  afterword?: string;
}

export interface GoldenItem {
  text?: string;
  quote?: string;
  explain?: string;
  note?: string;
  source?: string;
}

export interface DetailData {
  id?: string;
  name?: string;
  intro?: string;
  summary?: string;
  quote?: string;
  core?: string;
  nameOrigin?: string;
  background?: string;
  process?: string;
  result?: string;
  impact?: string;
  timeline?: TimelineItem[];
  people?: Array<PersonItem | string>;
  majorEvents?: Array<string | { name?: string; title?: string }>;
  controversies?: ViewpointItem[];
  openQuestions?: ViewpointItem[];
  chapters?: ChapterItem[];
  golden?: GoldenItem[];
  funFacts?: Array<string | { fact?: string; text?: string; note?: string }>;
  sources?: string[];
}

export interface SourceRecord {
  id: string;
  title: string;
  type?: string;
  note?: string;
}
