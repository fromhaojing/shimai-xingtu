import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const dynastyNames = {
  sui: '隋', tang: '唐', wudai: '五代', song: '宋',
  yuan: '元', ming: '明', qing: '清',
};
const sectionNames = {
  rujia: '儒家', daojia: '道家', foxue: '佛家', zhuzi: '诸子',
  lixue: '理学心学', shiwen: '诗词', gewu: '格物', myth: '神话',
};
const dynastyOrder = Object.keys(dynastyNames);
const sectionOrder = Object.keys(sectionNames);

const dataPath = (relativePath) => path.join(root, ...relativePath.split('/'));
const readJson = async (relativePath) => JSON.parse(await fs.readFile(dataPath(relativePath), 'utf8'));
const exists = async (relativePath) => fs.access(dataPath(relativePath)).then(() => true, () => false);
const clean = (value) => typeof value === 'string' ? value.trim() : '';
const text = (...values) => values.map(clean).find(Boolean) || '';

async function portraitPath(filename) {
  const name = clean(filename).split('/').at(-1);
  if (!name) return null;
  for (const parent of ['data/portraits', 'data/portraits/people']) {
    const candidate = `${parent}/${name}`;
    if (await exists(candidate)) return candidate;
  }
  return null;
}

const records = [];
const cases = [];
const missingPortraits = [];
const missingDetails = [];

for (const dynasty of dynastyOrder) {
  const indexPath = dynasty === 'ming'
    ? 'data/emperors/index.json'
    : `data/${dynasty}/emperors/index.json`;
  const index = await readJson(indexPath);
  for (const entry of index.emperors) {
    const detailPath = dynasty === 'ming'
      ? `data/emperors/${entry.file}`
      : `data/${dynasty}/emperors/${entry.file}`;
    if (!(await exists(detailPath))) {
      missingDetails.push(detailPath);
      continue;
    }
    const detail = await readJson(detailPath);
    const filename = text(detail.portrait, entry.portrait);
    const portrait = await portraitPath(filename);
    if (filename && !portrait) missingPortraits.push({ id: entry.id, filename });
    const reign = detail.reign || entry.reign;
    const period = typeof reign === 'object' && reign
      ? [reign.start, reign.end].filter(Boolean).join('—')
      : clean(reign);
    records.push({
      id: `emperor-${entry.id}`,
      group: 'emperor',
      title: text(detail.name, entry.name),
      subtitle: text(detail.templeName, entry.templeName, detail.eraName?.[0]),
      period,
      description: text(detail.intro, detail.summary),
      portrait,
      detailPath,
      sourceId: entry.id,
      subgroup: dynastyNames[dynasty],
    });
  }
}

for (const section of sectionOrder) {
  const index = await readJson(`data/${section}/index.json`);
  const group = ['rujia', 'daojia', 'foxue', 'zhuzi', 'lixue'].includes(section)
    ? 'thought'
    : section === 'shiwen' ? 'poetry' : section === 'gewu' ? 'craft' : 'myth';
  for (const entry of index.books || []) {
    const detailPath = `data/${section}/${entry.src}`;
    if (!(await exists(detailPath))) {
      missingDetails.push(detailPath);
      continue;
    }
    const detail = await readJson(detailPath);
    const filename = clean(entry.portrait);
    const portrait = await portraitPath(filename);
    if (filename && !portrait) missingPortraits.push({ id: `${section}-${entry.id}`, filename });
    records.push({
      id: `book-${section}-${entry.id}`,
      group,
      title: text(entry.name, detail.name),
      subtitle: text(entry.collectionName, entry.person, entry.category, entry.cardMeta),
      period: text(entry.era, entry.cardMeta, clean(entry.meta).split('·')[0]),
      description: text(detail.intro, detail.core, detail.quote, entry.meta),
      portrait,
      detailPath,
      sourceId: entry.id,
      subgroup: group === 'thought' ? sectionNames[section] : text(entry.category, sectionNames[section]),
    });
  }
}

const caseIds = new Set();
function addCases(entries, sourcePath, subgroup, categories = []) {
  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  for (const item of entries || []) {
    const id = `${sourcePath}:${item.id}`;
    if (caseIds.has(id)) continue;
    caseIds.add(id);
    cases.push({
      id: `case-${subgroup}-${item.id}`,
      group: 'case',
      title: text(item.name, item.title),
      subtitle: text(categoryNames[item.category], item.era, subgroup),
      period: text(item.date, item.era),
      description: text(item.summary, item.background),
      portrait: null,
      detailPath: null,
      sourceId: item.id,
      subgroup,
      sourcePath,
      body: item,
    });
  }
}

for (const dynasty of dynastyOrder) {
  const sourcePath = dynasty === 'ming' ? 'data/cases/cases.json' : `data/${dynasty}/cases.json`;
  const source = await readJson(sourcePath);
  addCases(Array.isArray(source) ? source : source.cases, sourcePath,
    dynastyNames[dynasty], source.categories || []);
}

for (const section of sectionOrder) {
  if (section === 'gewu') {
    const sourcePath = 'data/gewu/cases.json';
    const source = await readJson(sourcePath);
    const index = await readJson('data/gewu/index.json');
    addCases(source, sourcePath, sectionNames[section], index.categories || []);
    continue;
  }
  const sourcePath = `data/${section}/index.json`;
  const source = await readJson(sourcePath);
  addCases(source.cases, sourcePath, sectionNames[section], source.categories || []);
}

const counts = {
  emperor: records.filter((record) => record.group === 'emperor').length,
  thought: records.filter((record) => record.group === 'thought').length,
  poetry: records.filter((record) => record.group === 'poetry').length,
  craft: records.filter((record) => record.group === 'craft').length,
  myth: records.filter((record) => record.group === 'myth').length,
  case: cases.length,
  records: records.length,
};

if (missingDetails.length || records.length !== 152 || cases.length !== 76) {
  throw new Error(JSON.stringify({ counts, missingDetails }));
}

await fs.writeFile(path.join(root, 'catalog.json'),
  JSON.stringify({ counts, records, cases }, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ counts, missingPortraits }, null, 2));
