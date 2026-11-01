import { useMemo, useState } from 'react';
import { ERD_EXAMPLES, type ErdExample } from '../../engines/erd/examples';
import { mapErdToRm, relationshipKind, type ErdModel } from '../../engines/erd/model';
import { progressStore } from '../../lib/progress';
import { ErdDiagram } from '../erd/ErdDiagram';
import { Icon } from '../Icon';

export function RmTables({ model }: { model: ErdModel }) {
  const tables = useMemo(() => mapErdToRm(model), [model]);
  return (
    <div className="space-y-3">
      {tables.map((t) => (
        <div key={t.name} className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
          <p dir="ltr" className="text-left font-mono text-sm">
            <span className="font-bold text-navy-700 dark:text-white">{t.name}</span>(
            {t.columns.map((c, i) => (
              <span key={c.name}>
                {i > 0 && ', '}
                <span className={c.pk ? 'underline decoration-2 underline-offset-4' : ''}>{c.name}</span>
                {c.fk && <sup className="text-[10px] text-amber-600" title={`FK → ${c.fk.table}(${c.fk.column})`}>FK</sup>}
              </span>
            ))}
            )
          </p>
          <ul className="mt-1 list-disc pr-5 text-xs leading-6 text-slate-600 dark:text-slate-300">
            {t.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </div>
      ))}
      <p className="text-xs text-slate-500">الخط تحت العمود = مفتاح أساسي، و FK = مفتاح أجنبي.</p>
    </div>
  );
}

interface DrillItem {
  prompt: string;
  options: string[];
  answer: number;
  why: string;
}

/** Placement drill generated from the model with the same rules the mapping engine uses. */
function buildDrill(model: ErdModel): DrillItem[] {
  const items: DrillItem[] = [];
  for (const r of model.relationships) {
    const names = [...new Set(r.ends.map((e) => e.entity))];
    const opts = [...names.map((n) => `مفتاح أجنبي في ${n}`), `جدول جديد ${r.name}`];
    let answer: number;
    let why: string;
    if (r.identifying) {
      const weak = r.ends.find((e) => model.entities.find((x) => x.name === e.entity)?.weak)!.entity;
      answer = names.indexOf(weak);
      why = 'علاقة تعريفية لكيان ضعيف: مفتاح المالك يدخل في جدول الكيان الضعيف ويصبح جزءًا من مفتاحه.';
    } else if (r.ends.length > 2 || relationshipKind(r) === 'M:N') {
      answer = opts.length - 1;
      why = r.ends.length > 2 ? 'علاقة ثلاثية: جدول جديد بمفاتيح الكيانات الثلاثة.' : 'علاقة N:M: جدول وسيط يحمل مفتاحي الطرفين.';
    } else if (names.length === 1) {
      answer = 0;
      why = 'علاقة دائرية: عمود جديد في نفس الجدول يشير إلى مفتاحه.';
    } else if (relationshipKind(r) === '1:N') {
      const nSide = r.ends.find((e) => e.cardinality !== '1')!.entity;
      answer = names.indexOf(nSide);
      why = `علاقة 1:N: المفتاح الأجنبي في جهة N (${nSide}).`;
    } else {
      const [a, b] = r.ends;
      const host = b.total && !a.total ? b : a.total ? a : b;
      answer = names.indexOf(host.entity);
      why = `علاقة 1:1: المفتاح الأجنبي في جهة المشاركة الإلزامية (${host.entity}).`;
    }
    items.push({ prompt: `العلاقة ${r.name} (${r.ends.map((e) => `${e.entity}:${e.cardinality}`).join(' — ')})`, options: opts, answer, why });
  }
  return items;
}

export function MappingView({ example }: { example: ErdExample }) {
  const [shown, setShown] = useState(false);
  const drill = useMemo(() => buildDrill(example.model), [example]);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const done = Object.keys(picks).length === drill.length;
  const correct = drill.filter((d, i) => picks[i] === d.answer).length;

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-slate-50 p-3 text-sm leading-7 dark:bg-navy-900"><span className="font-semibold">المتطلبات: </span>{example.story}</p>
      <ErdDiagram example={example} height={380} />
      <div className="space-y-3">
        <p className="font-semibold">جرّب أولًا: أين يُمثَّل كل ربط في الجداول؟</p>
        {drill.map((d, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <p dir="auto" className="mb-2 text-sm font-medium">{d.prompt}</p>
            <div className="flex flex-wrap gap-2">
              {d.options.map((o, j) => {
                const picked = picks[i] === j;
                const state = picks[i] === undefined ? '' : j === d.answer ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : picked ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40' : 'opacity-60';
                return (
                  <button key={o} disabled={picks[i] !== undefined} onClick={() => setPicks({ ...picks, [i]: j })} className={`rounded-lg border px-3 py-1.5 text-sm ${state || 'border-slate-200 hover:bg-navy-50 dark:border-navy-600'}`}>{o}</button>
                );
              })}
            </div>
            {picks[i] !== undefined && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{d.why}</p>}
          </div>
        ))}
        {done && <p className="text-sm font-semibold">النتيجة: {correct} من {drill.length}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => { setShown(!shown); if (!shown) progressStore.recordLab('erd'); }}>{shown ? 'أخفِ النموذج العلائقي' : 'اعرض النموذج العلائقي الناتج'}</button>
        {done && <button className="btn-ghost" onClick={() => setPicks({})}><Icon name="reset" className="h-4 w-4" />أعد التدريب</button>}
      </div>
      {shown && <RmTables model={example.model} />}
    </div>
  );
}

export const exampleById = (id: string) => ERD_EXAMPLES.find((e) => e.id === id) ?? ERD_EXAMPLES[0];
