import { QuestionCard } from '../../components/QuestionCard';
import { SchemaBrowser } from '../../components/SchemaBrowser';
import { RaWorkbench } from '../../components/tools/RaWorkbench';
import { QUESTIONS } from '../../content';
import { SAMPLE_TABLES } from '../../content/sampleDb';
import { Tex } from '../../lib/rich';

const PRESETS = [
  { label: 'σ اختيار', expr: 'σ[Salary > 8000](Employee)' },
  { label: 'π إسقاط', expr: 'π[Name, City](Employee)' },
  { label: 'π ∘ σ', expr: "π[Name](σ[City = 'Abha' ∧ Salary ≥ 8000](Employee))" },
  { label: '¬ نفي', expr: "π[Name, City](σ[¬(City = 'Abha')](Employee))" },
  { label: '∪ اتحاد', expr: 'π[City](Employee) ∪ π[City](Customer)' },
  { label: '− فرق', expr: 'π[EmpID](Employee) − π[EmpID](Orders)' },
  { label: '⋈ ربط طبيعي', expr: 'π[OrderID, CName, Status](Customer ⋈ Orders)' },
  { label: 'ρ ربط ذاتي', expr: 'π[A.Name, B.Name](σ[A.City = B.City ∧ A.EmpID < B.EmpID](ρ[A](Employee) × ρ[B](Employee)))' },
];

const SYNTAX: [string, string][] = [
  ["σ[Salary > 5000 ∧ City = 'Abha'](Employee)", "\\sigma_{Salary > 5000 \\land City = 'Abha'}(Employee)"],
  ['π[Name, Salary](Employee)', '\\pi_{Name,\\,Salary}(Employee)'],
  ['ρ[E(Id, N)](π[EmpID, Name](Employee))', '\\rho_{E(Id,N)}(\\pi_{EmpID,Name}(Employee))'],
  ['R ⋈[R.a = S.b] S', 'R \\bowtie_{R.a = S.b} S'],
];

export default function AlgebraLab() {
  const exercises = QUESTIONS.filter((q) => q.type === 'ra');
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">مختبر الجبر العلائقي</h1>
        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">اكتب التعبير بالرموز أو بأزرار لوحة الرموز. يُقيَّم على بيانات حقيقية صغيرة، وتظهر كل خطوة وسيطة. الكلمات الإنجليزية مقبولة أيضًا: select, project, union, minus, join, and, or, not.</p>
      </header>
      <section className="card space-y-3">
        <h2 className="font-bold">الجداول المتاحة</h2>
        <SchemaBrowser tables={SAMPLE_TABLES} />
      </section>
      <section className="card"><RaWorkbench presets={PRESETS} /></section>
      <section className="card space-y-3">
        <h2 className="font-bold">طريقة الكتابة</h2>
        <div className="space-y-2">
          {SYNTAX.map(([code, tex]) => (
            <div key={code} className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-navy-900">
              <code dir="ltr" className="font-mono text-sm">{code}</code>
              <Tex tex={tex} />
            </div>
          ))}
        </div>
        <p className="text-xs leading-6 text-slate-500">النصوص بين علامتي تنصيص مفردتين. عند تشابه أسماء الأعمدة بعد الجداء اكتب Relation.Column. الاتحاد والفرق والتقاطع تتطلب نفس عدد الأعمدة.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">تمارين تُصحَّح تلقائيًا ({exercises.length})</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">يُقارن ناتج تعبيرك بالناتج المطلوب على بيانات المنصة: نفس الأعمدة ونفس الصفوف.</p>
        {exercises.map((q, i) => <QuestionCard key={q.id} q={q} index={i + 1} />)}
      </section>
    </div>
  );
}
