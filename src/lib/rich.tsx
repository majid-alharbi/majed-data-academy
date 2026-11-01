import katex from 'katex';
import { Fragment, useMemo, type ReactNode } from 'react';
import type { Block } from '../content/types';

export function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: block, throwOnError: false, strict: 'ignore', output: 'html' }),
    [tex, block],
  );
  return <span dir="ltr" className={block ? 'block overflow-x-auto py-2 text-center' : 'inline-block'} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Inline formatting: **bold**, `code`, $tex$. */
export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) parts.push(<strong key={k++} className="font-semibold text-navy-800 dark:text-white">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={k++} dir="ltr" className="code-inline">{tok.slice(1, -1)}</code>);
    else parts.push(<Tex key={k++} tex={tok.slice(1, -1)} />);
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

const NOTE_STYLE = {
  simple: { label: 'ببساطة', cls: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40', tag: 'text-emerald-700 dark:text-emerald-400' },
  remember: { label: 'احفظ', cls: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40', tag: 'text-amber-700 dark:text-amber-400' },
  warn: { label: 'انتبه', cls: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40', tag: 'text-rose-700 dark:text-rose-400' },
  extra: { label: 'إثراء', cls: 'border-navy-200 bg-navy-50 dark:border-navy-700 dark:bg-navy-800/50', tag: 'text-navy-600 dark:text-navy-200' },
} as const;

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4 leading-8">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p':
            return <p key={i}><Rich text={b.text} /></p>;
          case 'h':
            return <h3 key={i} className="pt-2 text-lg font-bold text-navy-700 dark:text-navy-100"><Rich text={b.text} /></h3>;
          case 'list':
            return (
              <ul key={i} className="list-disc space-y-1 pr-6 marker:text-navy-400">
                {b.items.map((it, j) => <li key={j}><Rich text={it} /></li>)}
              </ul>
            );
          case 'table':
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-700">
                <table className="w-full text-sm">
                  <thead className="bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-navy-100">
                    <tr>{b.head.map((h, j) => <th key={j} className="px-3 py-2 text-start font-semibold"><Rich text={h} /></th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-slate-100 dark:border-navy-800">
                        {r.map((c, k) => <td key={k} className="px-3 py-2 align-top"><Rich text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'code':
            return <pre key={i} dir="ltr" className="code-block">{b.code}</pre>;
          case 'math':
            return <div key={i} className="rounded-xl bg-white py-1 dark:bg-navy-900"><Tex tex={b.tex} block /></div>;
          case 'note': {
            const s = NOTE_STYLE[b.kind];
            return (
              <div key={i} className={`rounded-xl border p-4 ${s.cls}`}>
                <span className={`ml-1 font-bold ${s.tag}`}>{s.label}:</span> <Rich text={b.text} />
              </div>
            );
          }
        }
      })}
    </div>
  );
}
