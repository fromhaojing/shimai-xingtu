import type { SVGProps } from 'react';

type IconName = 'search' | 'arrow' | 'back' | 'external' | 'map' | 'lineage' | 'link' | 'chevron';
type Props = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, className = 'icon', ...props }: Props) {
  const content = {
    search: <><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 5 5" /></>,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    back: <path d="M20 12H5m6-6-6 6 6 6" />,
    external: <><path d="M13 5h6v6m0-6-9 9" /><path d="M18 14v5H5V6h5" /></>,
    map: <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16" />,
    lineage: <><circle cx="12" cy="4.5" r="2" /><circle cx="6" cy="19.5" r="2" /><circle cx="18" cy="19.5" r="2" /><path d="M12 6.5v5m-6 6v-4h12v4" /></>,
    link: <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 1 0 7.1 7.1l1.2-1.2" />,
    chevron: <path d="m7 10 5 5 5-5" />,
  }[name];
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{content}</svg>;
}
