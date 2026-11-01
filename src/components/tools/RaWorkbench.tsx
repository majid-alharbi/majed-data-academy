import { useState } from 'react';
import { AlgebraError, evaluate, sampleDatabase, type EvalResult } from '../../engines/algebra';
import { progressStore } from '../../lib/progress';
import { Tex } from '../../lib/rich';
import { Icon } from '../Icon';
import { RaInput } from '../RaInput';
import { RelationTable } from '../RelationTable';

const db = sampleDatabase();

export function RaWorkbench({ presets, initial }: { presets: { label: string; expr: string }[]; initial?: string }) {
  const [expr, setExpr] = useState(initial ?? presets[0]?.expr ?? '');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(true);

  const run = (src = expr) => {
    try {
      const r = evaluate(src, db);
      setResult(r);
      setError(null);
      progressStore.recordLab('algebra');
    } catch (e) {
      setResult(null);
      setError(e instanceof AlgebraError ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} className="chip cursor-pointer hover:bg-navy-100 dark:hover:bg-navy-600" onClick={() => { setExpr(p.expr); run(p.expr); }}>
            {p.label}
          </button>
        ))}
      </div>
      <RaInput value={expr} onChange={setExpr} onSubmit={() => run()} />
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={() => run()}><Icon name="play" className="h-4 w-4" />نفّذ</button>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-navy-700" checked={showSteps} onChange={(e) => setShowSteps(e.target.checked)} />اعرض الخطوات</label>
        <span className="text-xs text-slate-500">Ctrl + Enter للتنفيذ</span>
      </div>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {result && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-2 dark:bg-navy-900"><Tex tex={result.latex} block /></div>
          {showSteps && result.steps.length > 1 &&
            result.steps.slice(0, -1).map((s, i) => (
              <details key={i} className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
                <summary className="cursor-pointer text-sm text-navy-700 dark:text-navy-100">خطوة {i + 1}: <Tex tex={s.latex} /> ({s.relation.rows.length} صفوف)</summary>
                <div className="mt-2"><RelationTable relation={s.relation} /></div>
              </details>
            ))}
          <RelationTable relation={result.relation} caption={`النتيجة: ${result.relation.rows.length} صفوف × ${result.relation.attributes.length} أعمدة`} />
        </div>
      )}
    </div>
  );
}
