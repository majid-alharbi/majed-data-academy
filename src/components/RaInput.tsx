import { useRef } from 'react';

const SYMBOLS: { s: string; title: string }[] = [
  { s: 'σ[]', title: 'اختيار' },
  { s: 'π[]', title: 'إسقاط' },
  { s: 'ρ[]', title: 'إعادة تسمية' },
  { s: ' ∪ ', title: 'اتحاد' },
  { s: ' ∩ ', title: 'تقاطع' },
  { s: ' − ', title: 'فرق' },
  { s: ' × ', title: 'جداء' },
  { s: ' ⋈ ', title: 'ربط طبيعي' },
  { s: ' ∧ ', title: 'و' },
  { s: ' ∨ ', title: 'أو' },
  { s: '¬', title: 'ليس' },
  { s: ' ≥ ', title: 'أكبر أو يساوي' },
  { s: ' ≤ ', title: 'أصغر أو يساوي' },
  { s: ' ≠ ', title: 'لا يساوي' },
];

/** Text input for relational-algebra expressions with an on-screen symbol keyboard. */
export function RaInput({ value, onChange, onSubmit, rows = 2 }: { value: string; onChange: (v: string) => void; onSubmit?: () => void; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const insert = (s: string) => {
    const el = ref.current;
    if (!el) return onChange(value + s);
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + s + value.slice(end);
    onChange(next);
    // Place the cursor inside the brackets for σ[] / π[] / ρ[].
    const caret = start + (s.endsWith('[]') ? s.length - 1 : s.length);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" dir="ltr">
        {SYMBOLS.map((x) => (
          <button key={x.s} type="button" title={x.title} onClick={() => insert(x.s)} className="min-w-[2.5rem] rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-base text-navy-700 hover:bg-navy-50 dark:border-navy-600 dark:bg-navy-800 dark:text-navy-100">
            {x.s.trim().replace('[]', '')}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        dir="ltr"
        rows={rows}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder="π[Name](σ[City = 'Abha'](Employee))"
        className="input font-mono text-base"
      />
    </div>
  );
}
