import { useEffect, useRef, useState } from 'react';
import { AnswerInput, EssayRubric, Feedback, QuestionHeader } from '../components/QuestionCard';
import { CHAPTERS, QUESTIONS } from '../content';
import type { Question } from '../content/types';
import { grade, type Graded, type StudentResponse } from '../lib/grading';
import { progressStore } from '../lib/progress';
import { Rich } from '../lib/rich';

type Phase = 'setup' | 'running' | 'essays' | 'done';

function pick(chapters: string[], count: number, essays: boolean): Question[] {
  const pool = QUESTIONS.filter((q) => chapters.includes(q.chapterId) && (essays || q.type !== 'essay'));
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  // Keep the course order inside the exam so related questions sit together.
  return shuffled.sort((a, b) => QUESTIONS.indexOf(a) - QUESTIONS.indexOf(b));
}

export default function Exam() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [chapters, setChapters] = useState(CHAPTERS.map((c) => c.id));
  const [count, setCount] = useState(15);
  const [minutes, setMinutes] = useState(20);
  const [essays, setEssays] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, StudentResponse>>({});
  const [results, setResults] = useState<Record<string, Graded>>({});
  const [left, setLeft] = useState(0);
  const started = useRef(0);

  const submit = async () => {
    const objective = questions.filter((q) => q.type !== 'essay');
    const graded: Record<string, Graded> = {};
    for (const q of objective) graded[q.id] = await grade(q, answers[q.id] ?? {});
    setResults(graded);
    const hasEssays = questions.some((q) => q.type === 'essay');
    if (hasEssays) {
      setAnswers((a) => Object.fromEntries(questions.map((q) => [q.id, q.type === 'essay' ? { ...a[q.id], rubric: q.rubric.map(() => false) } : a[q.id] ?? {}])));
      setPhase('essays');
    } else finish(graded);
  };

  const finish = async (graded: Record<string, Graded>) => {
    const all = { ...graded };
    for (const q of questions.filter((x) => x.type === 'essay')) all[q.id] = await grade(q, answers[q.id] ?? {});
    for (const q of questions) progressStore.recordAnswer(q.id, all[q.id].correct, all[q.id].selfAssessed ? all[q.id].score : undefined);
    const score = questions.reduce((s, q) => s + all[q.id].score, 0);
    progressStore.recordExam({ at: Date.now(), chapters, total: questions.length, score: Math.round(score * 100) / 100, max: questions.length, durationSec: Math.round((Date.now() - started.current) / 1000) });
    setResults(all);
    setPhase('done');
  };

  useEffect(() => {
    if (phase !== 'running' || minutes === 0) return;
    if (left <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left]);

  const start = () => {
    const qs = pick(chapters, count, essays);
    setQuestions(qs);
    setAnswers({});
    setResults({});
    setLeft(minutes * 60);
    started.current = Date.now();
    setPhase('running');
    window.scrollTo(0, 0);
  };

  if (phase === 'setup') {
    const available = QUESTIONS.filter((q) => chapters.includes(q.chapterId) && (essays || q.type !== 'essay')).length;
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">محاكي الاختبار</h1>
          <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">اختبار بأسئلة عشوائية من البنك، بلا تصحيح فوري حتى التسليم. الأسئلة الموضوعية تُصحَّح آليًا، والمقالية تقيّمها بنفسك مقابل الإجابة النموذجية.</p>
        </header>
        <section className="card space-y-5">
          <fieldset>
            <legend className="mb-2 font-semibold">الفصول</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {CHAPTERS.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-navy-700" checked={chapters.includes(c.id)} onChange={(e) => setChapters(e.target.checked ? [...chapters, c.id] : chapters.filter((x) => x !== c.id))} />
                  {c.number}. {c.title}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1 text-sm"><span className="font-semibold">عدد الأسئلة</span>
              <select className="input" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}</select>
            </label>
            <label className="space-y-1 text-sm"><span className="font-semibold">الوقت</span>
              <select className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>{[[10, '10 دقائق'], [20, '20 دقيقة'], [30, '30 دقيقة'], [45, '45 دقيقة'], [0, 'بدون وقت']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-navy-700" checked={essays} onChange={(e) => setEssays(e.target.checked)} />تضمين أسئلة مقالية</label>
          </div>
          <p className="text-xs text-slate-500">المتاح بهذه الاختيارات: {available} سؤالًا{available < count ? ` (سيحتوي الاختبار ${available} فقط)` : ''}.</p>
          <button className="btn-primary" disabled={!chapters.length || available === 0} onClick={start}>ابدأ الاختبار</button>
        </section>
      </div>
    );
  }

  const answered = questions.filter((q) => answers[q.id] && (answers[q.id].choice !== undefined || answers[q.id].tf !== undefined || answers[q.id].text?.trim())).length;

  if (phase === 'running') {
    return (
      <div className="space-y-4">
        <div className="sticky top-14 z-10 flex items-center justify-between rounded-2xl bg-navy-800 px-4 py-3 text-white shadow lg:top-2">
          <span className="text-sm">أجبت عن {answered} من {questions.length}</span>
          {minutes > 0 && <span className={`font-mono text-lg ${left < 60 ? 'text-amber-300' : ''}`} dir="ltr">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span>}
          <button className="btn bg-white py-1 text-navy-800" onClick={submit}>سلّم</button>
        </div>
        {questions.map((q, i) => (
          <article key={q.id} className="card">
            <QuestionHeader q={q} index={i + 1} />
            {q.scenario && <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm leading-7 dark:bg-navy-900"><span className="font-semibold">الموقف: </span>{q.scenario}</p>}
            <p className="mb-4 font-medium leading-8"><Rich text={q.prompt} /></p>
            <AnswerInput q={q} value={answers[q.id] ?? {}} onChange={(r) => setAnswers({ ...answers, [q.id]: r })} />
          </article>
        ))}
        <button className="btn-primary w-full" onClick={submit}>سلّم الاختبار</button>
      </div>
    );
  }

  if (phase === 'essays') {
    const essayQs = questions.filter((q): q is Extract<Question, { type: 'essay' }> => q.type === 'essay');
    return (
      <div className="space-y-4">
        <header className="card">
          <h1 className="text-xl font-bold">قيّم إجاباتك المقالية</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">صُحّحت الأسئلة الموضوعية. قارن كل إجابة مقالية بالنموذج وحدد المعايير التي حققتها بصدق.</p>
        </header>
        {essayQs.map((q) => (
          <article key={q.id} className="card space-y-3">
            <p className="font-medium leading-8"><Rich text={q.prompt} /></p>
            <div className="rounded-xl bg-slate-50 p-3 text-sm leading-7 dark:bg-navy-900"><span className="font-semibold">إجابتك: </span>{answers[q.id]?.text?.trim() || <span className="text-slate-400">(لم تكتب إجابة)</span>}</div>
            <EssayRubric q={q} value={answers[q.id] ?? {}} onChange={(r) => setAnswers({ ...answers, [q.id]: r })} />
          </article>
        ))}
        <button className="btn-primary w-full" onClick={() => finish(results)}>اعرض النتيجة النهائية</button>
      </div>
    );
  }

  const total = questions.reduce((s, q) => s + (results[q.id]?.score ?? 0), 0);
  return (
    <div className="space-y-4">
      <section className="card text-center">
        <p className="text-sm text-slate-500">نتيجتك</p>
        <p className="mt-1 text-4xl font-bold text-navy-700 dark:text-white">{Math.round((total / questions.length) * 100)}%</p>
        <p className="mt-1 text-sm">{Math.round(total * 10) / 10} من {questions.length}{questions.some((q) => q.type === 'essay') ? ' (المقالي بتقييمك الذاتي)' : ''}</p>
        <button className="btn-primary mt-4" onClick={() => setPhase('setup')}>اختبار جديد</button>
      </section>
      {questions.map((q, i) => (
        <article key={q.id} className="card space-y-3">
          <QuestionHeader q={q} index={i + 1} />
          <p className="font-medium leading-8"><Rich text={q.prompt} /></p>
          {results[q.id] && <Feedback q={q} g={results[q.id]} />}
        </article>
      ))}
    </div>
  );
}
