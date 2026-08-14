import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

const linkPattern = /\[([^\]]+)\]\(((?:\/tour\/|https?:\/\/)[^\s)]+)\)|(\/tour\/[\w-]+|https?:\/\/[^\s]+)/g;

export function AiMessageText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(linkPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(<Fragment key={`text-${index}`}>{text.slice(lastIndex, index)}</Fragment>);

    const href = match[2] ?? match[3];
    const label = match[1] ?? href;
    const className = 'font-extrabold text-brand underline decoration-brand/40 underline-offset-4 transition hover:text-emerald-300';
    parts.push(href.startsWith('/tour/')
      ? <Link key={`link-${index}`} to={href} className={className}>{label}</Link>
      : <a key={`link-${index}`} href={href} target="_blank" rel="noreferrer" className={className}>{label}</a>);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(<Fragment key="text-end">{text.slice(lastIndex)}</Fragment>);
  return <>{parts}</>;
}
