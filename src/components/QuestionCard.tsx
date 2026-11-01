import { useState } from 'react';
import { KIND_LABEL, type Question } from '../content/types';
import { grade, isAnswered, type Graded, type StudentResponse } from '../lib/grading';
import { progressStore } from '../lib/progress';
import { Rich } from '../lib/rich';
import { Icon } from './Icon';
import { RaInput } from './RaInput';
import { DataTable, RelationTable } from './RelationTable';

const DIFF = ['', 'سهل', 'متوسط', 'متقدم'];

export function QuestionHeader({ q, index }: { q: Question; index?: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
      {index !== undefined && <span className="font-bold text-navy-700 dark:text-navy-100">سؤال {index}</span>}
      <span className="chip">{KIND_LABEL[q.kind]}</span>
      <span className="chip bg-slate-100 text-slate-600 dark:bg-navy-900 dark:text-slate-300">{DIFF[q.difficulty]}</span>
    </div>
  );
}

/** The answer area for any question type. Used both in practice (with feedback) and in exams (feedback later). */
export function AnswerInput({ q, value, onChange, disabled }: { q: Question; value: StudentResponse; onChange: (r: StudentResponse) => void; disabled?: boolean }) {
  if (q.type === 'choice') {
    return (
      <div className="grid gap-2">
        {q.options.map((o, i) => (
          <label key={i} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${value.choice === i ? 'border-navy-400 bg-navy-50 dark:bg-navy-700' : 'border-slate-200 hover:bg-slate-50 dark:border-navy-700 dark:hover:bg-navy-700/50'}`}>
            <input type="radio" className="mt-1 accent-navy-700" checked={value.choice === i} disabled={disabled} onChange={() => onChange({ choice: i })} />
            <span><Rich text={o} /></span>
          </label>
        ))}
      </div>
    );
  }
  if (q.type === 'tf') {
    return (
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button key={String(v)} type="button" disabled={disabled} onClick={() => onChange({ tf: v })} className={`btn flex-1 border ${value.tf === v ? 'border-navy-400 bg-navy-50 text-navy-800 dark:bg-navy-700 dark:text-white' : 'border-slate-200 bg-white dark:border-navy-700 dark:bg-navy-800'}`}>
            {v ? 'صح' : 'خطأ'}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === 'ra') return <RaInput value={value.text ?? ''} onChange={(t) => onChange({ text: t })} />;
  if (q.type === 'sql') {
    return (
      <textarea dir="ltr" rows={4} spellCheck={false} disabled={disabled} value={value.text ?? ''} onChange={(e) => onChange({ text: e.target.value })} placeholder="SELECT ..." className="input font-mono" />
    );
  }
  return (
    <textarea rows={5} disabled={disabled} value={value.text ?? ''} onChange={(e) => onChange({ ...value, text: e.target.value })} placeholder="اكتب إجابتك هنا ثم اعرض الإجابة النموذجية لتقييم نفسك" className="input leading-7" />
  );
}

export function EssayRubric({ q, value, onChange }: { q: Extract<Question, { type: 'essay' }>; value: StudentResponse; onChange: (r: StudentResponse) => void }) {
  const marks = value.rubric ?? q.rubric.map(() => false);
  return (
    <div className="space-y-3 rounded-xl border border-navy-200 bg-navy-50 p-4 dark:border-navy-700 dark:bg-navy-900">
      <p className="text-sm font-bold text-navy-700 dark:text-navy-100">الإجابة النموذجية</p>
      <p className="whitespace-pre-line text-sm leading-7"><Rich text={q.model} /></p>
      <p className="pt-2 text-sm font-bold text-navy-700 dark:text-navy-100">قيّم إجابتك: حدد العناصر التي ذكرتها</p>
      {q.rubric.map((r, i) => (
        <label key={i} className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={marks[i]} onChange={(e) => onChange({ ...value, rubric: marks.map((m, j) => (j === i ? e.target.checked : m)) })} />
          {r}
        </label>
      ))}
    </div>
  );
}

export function Feedback({ q, g }: { q: Question; g: Graded }) {
  const tone = g.selfAssessed ? 'border-navy-200 bg-navy-50 dark:border-navy-600 dark:bg-navy-900' : g.correct ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40' : 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40';
  return (
    <div className={`space-y-3 rounded-xl border p-4 text-sm leading-7 ${tone}`} role="status">
      <p className="flex items-center gap-2 font-bold">
        {!g.selfAssessed && <Icon name={g.correct ? 'check' : 'x'} className={`h-5 w-5 ${g.correct ? 'text-emerald-600' : 'text-rose-600'}`} />}
        {g.message}
      </p>
      {g.relation && <RelationTable relation={g.relation} caption="نتيجة تعبيرك" />}
      {g.table && <DataTable columns={g.table.columns} rows={g.table.rows} caption="نتيجة استعلامك" max={15} />}
      {q.type !== 'essay' && (
        <div>
          <span className="font-semibold">التعليل: </span>
          <Rich text={q.explanation} />
          {(q.type === 'ra' || q.type === 'sql') && !g.correct && (
            <pre dir="ltr" className="code-block mt-2">{q.expected}</pre>
          )}
        </div>
      )}
    </div>
  );
}

/** Practice card: answer → check → explanation, recorded in local progress. */
export function QuestionCard({ q, index }: { q: Question; index?: number }) {
  const [resp, setResp] = useState<StudentResponse>({});
  const [result, setResult] = useState<Graded | null>(null);
  const [busy, setBusy] = useState(false);
  const [showModel, setShowModel] = useState(false);

  const check = async () => {
    setBusy(true);
    const g = await grade(q, resp);
    setBusy(false);
    setResult(g);
    progressStore.recordAnswer(q.id, g.correct, g.selfAssessed ? g.score : undefined);
  };
  const retry = () => {
    setResp({});
    setResult(null);
    setShowModel(false);
  };

  return (
    <article className="card">
      <QuestionHeader q={q} index={index} />
      {q.scenario && <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm leading-7 dark:bg-navy-900"><span className="font-semibold">الموقف: </span>{q.scenario}</p>}
      <p className="mb-4 font-medium leading-8"><Rich text={q.prompt} /></p>
      <AnswerInput q={q} value={resp} onChange={setResp} disabled={!!result && q.type !== 'essay'} />
      {q.type === 'essay' && showModel && <div className="mt-4"><EssayRubric q={q} value={resp} onChange={setResp} /></div>}
      <div className="mt-4 flex flex-wrap gap-2">
        {!result && q.type === 'essay' && !showModel && (
          <button className="btn-primary" onClick={() => { setShowModel(true); setResp({ ...resp, rubric: q.rubric.map(() => false) }); }}>اعرض الإجابة النموذجية</button>
        )}
        {!result && (q.type !== 'essay' || showModel) && (
          <button className="btn-primary" disabled={busy || !isAnswered(q, resp)} onClick={check}>{busy ? 'جارٍ التصحيح…' : q.type === 'essay' ? 'احفظ التقييم' : 'تحقق'}</button>
        )}
        {result && <button className="btn-ghost" onClick={retry}><Icon name="reset" className="h-4 w-4" />حاول مرة أخرى</button>}
      </div>
      {result && <div className="mt-4"><Feedback q={q} g={result} /></div>}
    </article>
  );
}
