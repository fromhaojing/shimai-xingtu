import type { Entry } from './types';

function hashId(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function entrySlug(entry: Entry): string {
  return /^[a-z0-9-]+$/i.test(entry.id) ? entry.id : `case-${hashId(entry.id)}`;
}
