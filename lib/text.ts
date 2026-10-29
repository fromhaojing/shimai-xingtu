export function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

export function searchable(value: unknown): string {
  return cleanText(value).toLocaleLowerCase('zh-CN').replace(/\s+/g, '');
}

export function sourceUrl(relativePath: string): string {
  return `https://github.com/zinging/chinese-history-atlas/blob/0a514c9449acc5d71e638d3f0791c118b1496902/${relativePath.split('/').map(encodeURIComponent).join('/')}`;
}
