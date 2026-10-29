export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function assetUrl(relativePath: string): string {
  return `${basePath}/${relativePath.replace(/^\/+/, '')}`;
}
