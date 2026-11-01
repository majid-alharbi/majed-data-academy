import { useMemo, useState } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import { CHAPTERS, QUESTIONS } from '../content';
import { KIND_LABEL, type Question } from '../content/types';
import { useProgress } from '../lib/progress';

const PAGE = 10;

export default function QuestionBank() {
  const p = useProgress();
  const [chapter, setChapter] = useState('all');
  const [kind, setKind] = useState<'all' | Question['kind']>('all');
  const [diff, setDiff] = useState('all');
  const [status, setStatus] = useState<'all' | 'new' | 'wrong'>('all');
  const [page, setPage] = useState(0);

  // Status uses the progress snapshot taken when filters change, so answering a question doesn't make it vanish mid-page.
  const list = useMemo(
    () =>
      QUESTIONS.filter(
        (q) =>
          (chapter === 'all' || q.chapterId === chapter) &&
          (kind === 'all' || q.kind === kind) &&
          (diff === 'all' || String(q.difficulty) === diff) &&
          (status === 'all' || (status === 'new' ? !p.answers[q.id] : p.answers[q.id] && !p.answers[q.id].correct)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapter, kind, diff, status],
  );
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice(page * PAGE, page * PAGE + PAGE);
  const counts = useMemo(() => {
    const c: Partial<Record<Question['kind'], number>> = {};
    QUESTIONS.forEach((q) => (c[q.kind] = (c[q.kind] ?? 0) + 1));
    return c;
  }, []);

  const select = (value: string, set: (v: never) => void, options: [string, string][], label: string) => (
    <label className="space-y-1 text-xs">
      <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <select className="input" value={value} onChange={(e) => { set(e.target.value as never); setPage(0); }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">بنك الأسئلة</h1>
        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {QUESTIONS.length} سؤالًا مراجعًا تغطي الملخص كاملًا:{' '}
          {Object.entries(counts).map(([k, n]) => `${KIND_LABEL[k as Question['kind']]} ${n}`).join(' · ')}.
          أسئلة الجبر العلائقي و SQL تُصحَّح بتنفيذ إجابتك فعليًا، والمقالية بتقييم ذاتي مقابل إجابة نموذجية ومعايير.
        </p>
      </header>
      <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {select(chapter, setChapter, [['all', 'كل الفصول'], ...CHAPTERS.map((c) => [c.id, `${c.number}. ${c.title}`] as [string, string])], 'الفصل')}
        {select(kind, setKind, [['all', 'كل الأنواع'], ...Object.entries(KIND_LABEL)], 'النوع')}
        {select(diff, setDiff, [['all', 'كل المستويات'], ['1', 'سهل'], ['2', 'متوسط'], ['3', 'متقدم']], 'الصعوبة')}
        {select(status, setStatus, [['all', 'الكل'], ['new', 'لم أجب عنها'], ['wrong', 'أخطأت فيها']], 'الحالة')}
      </div>
      <p className="text-sm text-slate-500">{list.length} سؤالًا مطابقًا</p>
      <div className="space-y-4">
        {shown.map((q, i) => <QuestionCard key={q.id} q={q} index={page * PAGE + i + 1} />)}
        {list.length === 0 && <p className="card text-center text-slate-500">لا توجد أسئلة بهذه المعايير.</p>}
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button className="btn-ghost" disabled={page === 0} onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }}>السابق</button>
          <span className="text-sm">صفحة {page + 1} من {pages}</span>
          <button className="btn-ghost" disabled={page >= pages - 1} onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}>التالي</button>
        </div>
      )}
    </div>
  );
}
