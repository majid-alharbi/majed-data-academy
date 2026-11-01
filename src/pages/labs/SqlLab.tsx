import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { Feedback } from '../../components/QuestionCard';
import { SchemaBrowser } from '../../components/SchemaBrowser';
import { SqlRunner } from '../../components/tools/SqlRunner';
import type { Question } from '../../content/types';
import { SQL_EXERCISES, type SqlExercise } from '../../content/sqlExercises';
import { ALL_TABLES } from '../../engines/sql';
import { grade, type Graded } from '../../lib/grading';
import { progressStore } from '../../lib/progress';

function useDark() {
  const q = '(prefers-color-scheme: dark)';
  const [dark, setDark] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setDark(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return dark;
}

const asQuestion = (ex: SqlExercise): Question => ({
  id: ex.id, chapterId: 'ch5', lessonId: 'l5-2', kind: 'sql', difficulty: 2, prompt: ex.prompt, explanation: ex.explanation, type: 'sql', expected: ex.solution,
});

function Exercise({ ex, index }: { ex: SqlExercise; index: number }) {
  const [sql, setSql] = useState('');
  const [g, setG] = useState<Graded | null>(null);
  const [hint, setHint] = useState(false);
  const check = async () => {
    const q = asQuestion(ex);
    const r = await grade(q, { text: sql });
    setG(r);
    progressStore.recordAnswer(ex.id, r.correct);
  };
  return (
    <article className="card space-y-3">
      <p className="text-xs font-bold text-navy-600 dark:text-navy-200">تمرين {index}: {ex.title}</p>
      <p className="leading-8">{ex.prompt}</p>
      <textarea dir="ltr" rows={3} spellCheck={false} className="input font-mono" value={sql} onChange={(e) => { setSql(e.target.value); setG(null); }} placeholder="SELECT ..." />
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={!sql.trim()} onClick={check}>صحّح</button>
        <button className="btn-ghost" onClick={() => setHint(!hint)}>تلميح</button>
      </div>
      {hint && <p className="text-sm text-slate-600 dark:text-slate-300">{ex.hint}</p>}
      {g && <Feedback q={asQuestion(ex)} g={g} />}
    </article>
  );
}

export default function SqlLab() {
  const dark = useDark();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">مختبر Oracle SQL</h1>
        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">اكتب الاستعلام وشغّله على قاعدة بيانات خاصة بك داخل المتصفح. لن يتأثر أحد بما تكتبه، ويمكنك إعادة البيانات الأصلية في أي وقت.</p>
      </header>
      <section className="card space-y-3">
        <h2 className="font-bold">الجداول المتاحة</h2>
        <SchemaBrowser tables={ALL_TABLES} />
      </section>
      <section className="card">
        <SqlRunner
          initial={'SELECT last_name, salary\nFROM hr.employees\nWHERE department_id = 80 AND salary > 10000\nORDER BY salary DESC;'}
          editor={(value, onChange, run) => (
            <div dir="ltr" className="overflow-hidden rounded-xl border border-slate-300 dark:border-navy-600">
              <Editor
                height="220px"
                language="sql"
                theme={dark ? 'vs-dark' : 'light'}
                value={value}
                onChange={(v) => onChange(v ?? '')}
                onMount={(editor, monaco) => editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run)}
                loading={<textarea className="input h-[220px] font-mono" value={value} onChange={(e) => onChange(e.target.value)} />}
                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true }}
              />
            </div>
          )}
        />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">تمارين تُصحَّح تلقائيًا ({SQL_EXERCISES.length})</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">التصحيح يقارن نتيجتك بنتيجة الحل النموذجي: نفس عدد الأعمدة والقيم، ونفس الترتيب عندما يطلب التمرين ORDER BY. أسماء الأعمدة المستعارة لا تؤثر.</p>
        {SQL_EXERCISES.map((ex, i) => <Exercise key={ex.id} ex={ex} index={i + 1} />)}
      </section>
    </div>
  );
}
