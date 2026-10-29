'use client';

import { useState } from 'react';
import { Icon } from './icons';

export function CopyLinkButton() {
  const [status, setStatus] = useState('复制此页链接');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('链接已复制');
    } catch {
      setStatus('复制失败');
    }
    window.setTimeout(() => setStatus('复制此页链接'), 2000);
  };
  return <button type="button" className="copy-button" onClick={copy} aria-label={status}><Icon name="link" /> <span>{status}</span></button>;
}
