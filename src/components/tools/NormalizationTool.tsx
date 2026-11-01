import { useMemo, useState } from 'react';
import { analyze, closure, FDError, fdToString, parseAttributes, parseFDs, synthesize3NF } from '../../engines/normalization';
import { progressStore } from '../../lib/progress';

const NF_LABEL = { '1NF': '1NF فقط', '2NF': '2NF', '3NF': '3NF', BCNF: 'BCNF (يحقق 3NF أيضًا)' };

export function NormalizationTool({ preset }: { preset: { attrs: string; fds: string } }) {
  const [attrs, setAttrs] = useState(preset.attrs);
  const [fds, setFds] = useState(preset.fds);
  const [closureInput, setClosureInput] = useState('');

  const out = useMemo(() => {
    try {
      const all = parseAttributes(attrs);
      const deps = parseFDs(fds, all);
      return { all, deps, analysis: analyze(all, deps), synthesis: synthesize3NF(all, deps), error: null as string | null };
    } catch (e) {
      return { error: e instanceof FDError ? e.message : String(e) };
    }
  }, [attrs, fds]);

  const clo = useMemo(() => {
    if (!closureInput.trim() || out.error || !('all' in out)) return null;
    try {
      const x = parseAttributes(closureInput);
      const bad = x.filter((a) => !out.all!.includes(a));
      if (bad.length) return `صفات غير موجودة: ${bad.join('، ')}`;
      return `{${x.join(', ')}}⁺ = {${closure(x, out.deps!).join(', ')}}`;
    } catch {
      return null;
    }
  }, [closureInput, out]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">صفات العلاقة (مفصولة بفواصل)</span>
          <input dir="ltr" className="input font-mono" value={attrs} onChange={(e) => setAttrs(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">الاعتمادات الوظيفية (سطر لكل اعتماد: A, B -&gt; C)</span>
          <textarea dir="ltr" rows={4} className="input font-mono" value={fds} onChange={(e) => setFds(e.target.value)} onBlur={() => progressStore.recordLab('normalization')} />
        </label>
      </div>
      {out.error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{out.error}</p>}
      {'analysis' in out && out.analysis && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
            <p className="text-sm text-slate-500">أعلى شكل طبيعي</p>
            <p className="text-2xl font-bold text-navy-700 dark:text-white">{NF_LABEL[out.analysis.normalForm]}</p>
            <p className="mt-3 text-sm"><span className="font-semibold">المفاتيح المرشحة: </span><span dir="ltr" className="font-mono">{out.analysis.keys.map((k) => `{${k.join(', ')}}`).join('  ')}</span></p>
            <p className="mt-1 text-sm"><span className="font-semibold">الصفات الأولية: </span><span dir="ltr" className="font-mono">{out.analysis.prime.join(', ')}</span></p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-navy-700">
            <p className="mb-2 text-sm font-semibold">المخالفات</p>
            {out.analysis.violations.length === 0 ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">لا توجد مخالفات: كل محدِّد مفتاح فائق.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {out.analysis.violations.filter((v) => v.form !== 'BCNF' || !out.analysis!.violations.some((w) => w.form === '3NF' && w.fd === v.fd)).map((v, i) => (
                  <li key={i}><span className="chip ml-1">{v.form}</span><span dir="ltr" className="font-mono">{fdToString(v.fd)}</span><br /><span className="text-slate-600 dark:text-slate-300">{v.reason}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 p-4 md:col-span-2 dark:border-navy-700">
            <p className="mb-2 text-sm font-semibold">تفكيك إلى 3NF (بدون فقد بيانات ومع حفظ الاعتمادات)</p>
            <ul dir="ltr" className="space-y-1 font-mono text-sm">
              {out.synthesis!.map((r, i) => (
                <li key={i}>R{i + 1}({r.attributes.map((a) => (r.key.includes(a) ? <u key={a} className="decoration-2">{a}</u> : <span key={a}>{a}</span>)).reduce<React.ReactNode[]>((acc, el, j) => (j ? [...acc, ', ', el] : [el]), [])})</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <label className="block space-y-1 text-sm">
        <span className="font-semibold">احسب الإغلاق X⁺ لمجموعة صفات</span>
        <input dir="ltr" className="input font-mono" placeholder="OrderID" value={closureInput} onChange={(e) => setClosureInput(e.target.value)} />
      </label>
      {clo && <p dir="ltr" className="font-mono text-sm">{clo}</p>}
    </div>
  );
}
