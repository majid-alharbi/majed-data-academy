import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityView } from '../components/activities/ActivityView';
import { Icon } from '../components/Icon';
import { QuestionCard } from '../components/QuestionCard';
import { findChapter, findLesson, lessonQuestions, neighbours, SOURCE_TITLE } from '../content';
import { progressStore, useProgress } from '../lib/progress';
import { Blocks, Rich } from '../lib/rich';
import NotFound from './NotFound';

const STAGES = [
  { id: 'explain', label: 'افهم' },
  { id: 'example', label: 'شاهد' },
  { id: 'activity', label: 'جرّب' },
  { id: 'quiz', label: 'طبّق واختبر' },
  { id: 'mistakes', label: 'أخطاء شائعة' },
  { id: 'review', label: 'راجع' },
] as const;
type Stage = (typeof STAGES)[number]['id'];

const BREAK_SECONDS = 5 * 60;

export default function LessonPage() {
  const { id = '' } = useParams();
  const lesson = findLesson(id);
  const p = useProgress();
  const [stage, setStage] = useState<Stage>('explain');
  const [simple, setSimple] = useState(false);
  const [brainMenu, setBrainMenu] = useState(false);
  const [brief, setBrief] = useState(false);
  const [breakLeft, setBreakLeft] = useState<number | null>(null);

  useEffect(() => {
    setStage('explain');
    setSimple(false);
    setBrief(false);
  }, [id]);

  useEffect(() => {
    if (breakLeft === null) return;
    if (breakLeft <= 0) {
      setBreakLeft(null);
      return;
    }
    const t = setTimeout(() => setBreakLeft(breakLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [breakLeft]);

  if (!lesson) return <NotFound />;
  const chapter = findChapter(lesson.chapterId)!;
  const questions = lessonQuestions(lesson.id);
  const { prev, next } = neighbours(lesson.id);
  const done = !!p.lessons[lesson.id];
  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="space-y-5">
      <nav className="text-xs text-slate-500">
        <Link to="/courses" className="hover:underline">الفصول</Link> / الفصل {chapter.number}: {chapter.title}
      </nav>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold leading-snug">{lesson.title}</h1>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300"><span className="font-semibold">هدف الدرس: </span>{lesson.goal}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button className={simple ? 'btn-primary' : 'btn-ghost'} onClick={() => { setSimple(!simple); setBrief(false); setStage('explain'); }} aria-pressed={simple}>
            <Icon name="bulb" className="h-4 w-4" />اشرحها أبسط
          </button>
          <button className="btn-ghost" onClick={() => setBrainMenu(true)}>
            <Icon name="pause" className="h-4 w-4" />مخي قفل
          </button>
          {done && <span className="chip self-center bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">✓ مكتمل</span>}
        </div>
      </header>

      {brief ? (
        <section className="card space-y-4 border-amber-200 dark:border-amber-900">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300">الخلاصة فقط</p>
          <p className="text-lg leading-9"><Rich text={lesson.brief.text} /></p>
          <p className="rounded-xl bg-slate-50 p-3 leading-8 dark:bg-navy-900"><span className="font-semibold">مثال واحد: </span><Rich text={lesson.brief.example} /></p>
          <button className="btn-primary" onClick={() => setBrief(false)}>رجعت لي طاقتي — أكمل الدرس</button>
        </section>
      ) : (
        <>
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-1" role="tablist">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={stage === s.id}
                onClick={() => setStage(s.id)}
                className={`shrink-0 rounded-xl px-3 py-2 text-sm ${stage === s.id ? 'bg-navy-700 text-white' : i < stageIndex ? 'bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-100' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-800'}`}
              >
                {i + 1}. {s.label}
                {s.id === 'quiz' && ` (${questions.length})`}
              </button>
            ))}
          </div>

          <section className="card fade-in" key={stage + String(simple)}>
            {stage === 'explain' && (
              <div className="space-y-5">
                {simple && <Blocks blocks={lesson.simpler} />}
                {simple && <hr className="border-slate-200 dark:border-navy-700" />}
                <Blocks blocks={lesson.explain} />
              </div>
            )}
            {stage === 'example' && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold">مثال واقعي: {lesson.example.title}</h2>
                <Blocks blocks={lesson.example.blocks} />
              </div>
            )}
            {stage === 'activity' && <ActivityView activity={lesson.activity} />}
            {stage === 'quiz' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">أجب ثم اضغط «تحقق» لترى التصحيح والتعليل. تُحفظ نتيجتك في لوحة تقدمك.</p>
                {questions.map((q, i) => <QuestionCard key={q.id} q={q} index={i + 1} />)}
              </div>
            )}
            {stage === 'mistakes' && (
              <ul className="space-y-3">
                {lesson.mistakes.map((m) => (
                  <li key={m} className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-7 dark:border-rose-900 dark:bg-rose-950/40">
                    <Icon name="x" className="mt-1 h-4 w-4 shrink-0 text-rose-600" /><Rich text={m} />
                  </li>
                ))}
              </ul>
            )}
            {stage === 'review' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">مراجعة قصيرة</h2>
                <ul className="space-y-2">
                  {lesson.review.map((r) => (
                    <li key={r} className="flex gap-3 leading-7"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><Rich text={r} /></li>
                  ))}
                </ul>
                <button className={done ? 'btn-ghost' : 'btn-primary'} onClick={() => (done ? progressStore.uncompleteLesson(lesson.id) : progressStore.completeLesson(lesson.id))}>
                  {done ? 'إلغاء علامة الإكمال' : 'أكملت هذا الدرس ✓'}
                </button>
              </div>
            )}
          </section>

          <div className="flex justify-between gap-2">
            <button className="btn-ghost" disabled={stageIndex === 0} onClick={() => setStage(STAGES[stageIndex - 1].id)}>المرحلة السابقة</button>
            {stageIndex < STAGES.length - 1 ? (
              <button className="btn-primary" onClick={() => setStage(STAGES[stageIndex + 1].id)}>التالي: {STAGES[stageIndex + 1].label}</button>
            ) : next ? (
              <Link className="btn-primary" to={`/lesson/${next.id}`}>الدرس التالي</Link>
            ) : (
              <Link className="btn-primary" to="/exam">إلى الاختبار</Link>
            )}
          </div>
        </>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-navy-700">
        <span>المرجع: {SOURCE_TITLE} — صفحة {lesson.sourcePages.join('، ')}</span>
        <span className="flex gap-3">
          {prev && <Link to={`/lesson/${prev.id}`} className="hover:underline">→ {prev.title}</Link>}
          {next && <Link to={`/lesson/${next.id}`} className="hover:underline">{next.title} ←</Link>}
        </span>
      </footer>

      {brainMenu && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-navy-900/60 p-4" role="dialog" aria-modal="true" aria-label="مخي قفل" onClick={() => setBrainMenu(false)}>
          <div className="card w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold">مخك قفل؟ لا بأس.</p>
            <button className="btn-primary w-full" onClick={() => { setBrief(true); setBrainMenu(false); }}>اعطني الخلاصة ومثالًا واحدًا فقط</button>
            <button className="btn-ghost w-full" onClick={() => { setBreakLeft(BREAK_SECONDS); setBrainMenu(false); }}>أوقف الدرس واعطني استراحة 5 دقائق</button>
            <button className="w-full py-2 text-sm text-slate-500" onClick={() => setBrainMenu(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {breakLeft !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-800 p-6 text-center text-white" role="dialog" aria-modal="true" aria-label="استراحة">
          <div className="space-y-6">
            <p className="text-lg text-navy-100">استراحة. قم، اشرب ماء، وأرح عينيك.</p>
            <p className="font-mono text-6xl font-bold" dir="ltr">{String(Math.floor(breakLeft / 60)).padStart(2, '0')}:{String(breakLeft % 60).padStart(2, '0')}</p>
            <p className="text-sm text-navy-200">الدرس موقوف عند مرحلة «{STAGES[stageIndex].label}» وسيعود كما تركته.</p>
            <button className="btn bg-white text-navy-800" onClick={() => setBreakLeft(null)}>استأنف الدرس</button>
          </div>
        </div>
      )}
    </div>
  );
}
