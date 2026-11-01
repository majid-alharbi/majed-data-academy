import { useMemo, useState } from 'react';
import { Rich } from '../../lib/rich';
import { Icon } from '../Icon';

export function Classify({ title, buckets, items }: { title: string; buckets: string[]; items: { text: string; bucket: number; why: string }[] }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const answered = Object.keys(picks).length;
  const correct = items.filter((it, i) => picks[i] === it.bucket).length;
  return (
    <div className="space-y-3">
      <p className="font-semibold">{title}</p>
      {items.map((it, i) => {
        const p = picks[i];
        return (
          <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <p className="mb-2 text-sm font-medium" dir="auto">{it.text}</p>
            <div className="flex flex-wrap gap-2">
              {buckets.map((b, j) => {
                const state = p === undefined ? 'border-slate-200 hover:bg-navy-50 dark:border-navy-600' : j === it.bucket ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : p === j ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40' : 'border-slate-200 opacity-50 dark:border-navy-700';
                return (
                  <button key={b} disabled={p !== undefined} onClick={() => setPicks({ ...picks, [i]: j })} className={`rounded-lg border px-3 py-1.5 text-sm ${state}`}>{b}</button>
                );
              })}
            </div>
            {p !== undefined && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{p === it.bucket ? '✓ ' : '✗ '}{it.why}</p>}
          </div>
        );
      })}
      <div className="flex items-center gap-3 text-sm">
        <span>{answered} / {items.length} — صحيح: {correct}</span>
        {answered > 0 && <button className="btn-ghost" onClick={() => setPicks({})}><Icon name="reset" className="h-4 w-4" />من جديد</button>}
      </div>
    </div>
  );
}

export function Flashcards({ title, cards }: { title: string; cards: { front: string; back: string }[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = cards[i];
  const go = (d: number) => {
    setFlipped(false);
    setI((i + d + cards.length) % cards.length);
  };
  return (
    <div className="space-y-3">
      <p className="font-semibold">{title}</p>
      <button onClick={() => setFlipped(!flipped)} className={`grid min-h-[150px] w-full place-items-center rounded-2xl border-2 p-6 text-center text-xl font-semibold transition-colors ${flipped ? 'border-navy-400 bg-navy-700 text-white' : 'border-navy-200 bg-white text-navy-800 dark:bg-navy-900 dark:text-white'}`}>
        <Rich text={flipped ? c.back : c.front} />
      </button>
      <div className="flex items-center justify-between text-sm">
        <button className="btn-ghost" onClick={() => go(-1)}>السابقة</button>
        <span>{i + 1} / {cards.length} · اضغط البطاقة لقلبها</span>
        <button className="btn-ghost" onClick={() => go(1)}>التالية</button>
      </div>
    </div>
  );
}

function shuffled<T>(xs: T[], seed: number): T[] {
  const a = [...xs];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Never start already solved.
  return a.join() === xs.join() ? [...a.slice(1), a[0]] : a;
}

export function OrderGame({ title, correct, why }: { title: string; correct: string[]; why: string }) {
  const initial = useMemo(() => shuffled(correct, 7), [correct]);
  const [items, setItems] = useState(initial);
  const [checked, setChecked] = useState(false);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setChecked(false);
  };
  const ok = items.join() === correct.join();
  return (
    <div className="space-y-3">
      <p className="font-semibold">{title}</p>
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={it} className={`flex items-center justify-between rounded-xl border p-2 ${checked ? (it === correct[i] ? 'border-emerald-400' : 'border-rose-400') : 'border-slate-200 dark:border-navy-700'}`}>
            <span className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-navy-50 text-sm dark:bg-navy-700">{i + 1}</span><code dir="ltr" className="font-mono">{it}</code></span>
            <span className="flex gap-1">
              <button aria-label="إلى الأعلى" className="btn-ghost min-h-0 px-2 py-1" onClick={() => move(i, -1)}>▲</button>
              <button aria-label="إلى الأسفل" className="btn-ghost min-h-0 px-2 py-1" onClick={() => move(i, 1)}>▼</button>
            </span>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={() => setChecked(true)}>تحقق</button>
        <button className="btn-ghost" onClick={() => { setItems(initial); setChecked(false); }}><Icon name="reset" className="h-4 w-4" />من جديد</button>
      </div>
      {checked && <p className={`text-sm ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-300'}`}>{ok ? `✓ ترتيب صحيح. ${why}` : 'ليس بعد؛ العناصر ذات الإطار الأحمر في غير موضعها.'}</p>}
    </div>
  );
}
