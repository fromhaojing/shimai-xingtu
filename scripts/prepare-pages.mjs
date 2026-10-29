import { copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Next.js 16 static export writes segment payloads in nested __next.* folders.
// Its client router requests the same payloads with dotted filenames. Static
// hosts such as GitHub Pages do not rewrite those URLs, so duplicate the small
// text payloads at the requested paths after building.
const outputRoot = path.resolve('out');
let copied = 0;

async function flattenSegmentFolder(segmentFolder, routeFolder, parts = []) {
  for (const entry of await readdir(segmentFolder, { withFileTypes: true })) {
    const source = path.join(segmentFolder, entry.name);
    if (entry.isDirectory()) {
      await flattenSegmentFolder(source, routeFolder, [...parts, entry.name]);
    } else if (entry.isFile() && entry.name.endsWith('.txt')) {
      const flattenedName = [...parts, entry.name].join('.');
      await copyFile(source, path.join(routeFolder, flattenedName));
      copied += 1;
    }
  }
}

async function walk(routeFolder) {
  for (const entry of await readdir(routeFolder, { withFileTypes: true })) {
    if (!entry.isDirectory() || ['_next', 'data'].includes(entry.name)) continue;
    const child = path.join(routeFolder, entry.name);
    if (entry.name.startsWith('__next.')) await flattenSegmentFolder(child, routeFolder, [entry.name]);
    else await walk(child);
  }
}

await walk(outputRoot);
console.log(`Prepared ${copied} static router payloads for GitHub Pages.`);
