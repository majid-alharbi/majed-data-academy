import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from '../components/ProgressBar';
import { CHAPTERS, LESSONS, QUESTIONS } from '../content';
import { progressStore, useProgress } from '../lib/progress';
import { chapterStats, overallStats, pct } from '../lib/stats';

export default function ProgressPage() {
  const p = useProgress();
  const s = overallStats(p);
  const [confirm, setConfirm] = useState(false);
  const wrong = QUESTIONS.filter((q) => p.answers[q.id] && !p.answers[q.id].correct);
  const weakest = CHAPTERS.map((c) => ({ c, st: chapterStats(p, c.id) }))
    .filter((x) => x.st.answered >= 3)
    .sort((a, b) => a.st.correct / a.st.answered - b.st.correct / b.st.answered)[0];

  const download = () => {
    const blob = new Blob([progressStore.export()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'majed-data-academy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">لوحة تقدمي</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">محفوظة في هذا المتصفح فقط. إذا مسحت بيانات المتصفح أو غيرت الجهاز تبدأ من جديد.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card"><p className="text-xs text-slate-500">الدروس</p><p className="text-2xl font-bold">{s.lessonsDone} / {s.lessonsTotal}</p><div className="mt-2"><ProgressBar value={s.lessonsDone / s.lessonsTotal} /></div></div>
        <div className="card"><p className="text-xs text-slate-500">الأسئلة المجاب عنها</p><p className="text-2xl font-bold">{s.answered} / {s.questionsTotal}</p><div className="mt-2"><ProgressBar value={s.answered / s.questionsTotal} /></div></div>
        <div className="card"><p className="text-xs text-slate-500">نسبة الصواب (آخر محاولة)</p><p className="text-2xl font-bold">{s.answered ? pct(s.correct / s.answered) : '—'}</p><p className="mt-2 text-xs text-slate-500">{s.correct} صحيحة من {s.answered}</p></div>
      </section>

      {weakest && (
        <section className="card border-amber-200 dark:border-amber-900">
          <p className="text-sm">أضعف فصل حاليًا: <strong>{weakest.c.title}</strong> ({pct(weakest.st.correct / weakest.st.answered)} صواب). <Link to={`/lesson/${weakest.c.lessons[0].id}`} className="text-navy-600 underline dark:text-navy-200">راجعه</Link></p>
        </section>
      )}

      <section className="card space-y-4">
        <h2 className="font-bold">الإتقان حسب الفصل</h2>
        {CHAPTERS.map((c) => {
          const st = chapterStats(p, c.id);
          return (
            <div key={c.id}>
              <div className="mb-1 flex justify-between text-sm"><span>{c.number}. {c.title}</span><span className="text-slate-500">{st.correct}/{st.questionsTotal} صحيحة · {st.lessonsDone}/{st.lessonsTotal} دروس</span></div>
              <ProgressBar value={st.mastery} label={c.title} />
            </div>
          );
        })}
        <p className="text-xs text-slate-500">الإتقان = الأسئلة التي أجبت عنها إجابة صحيحة في آخر محاولة ÷ كل أسئلة الفصل.</p>
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">الدروس</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {LESSONS.map((l) => (
            <Link key={l.id} to={`/lesson/${l.id}`} className="flex items-center gap-2 text-sm hover:underline">
              <span className={`h-2.5 w-2.5 rounded-full ${p.lessons[l.id] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-navy-600'}`} />{l.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">سجل الاختبارات</h2>
        {p.exams.length === 0 ? (
          <p className="text-sm text-slate-500">لم تؤدِّ اختبارًا بعد. <Link to="/exam" className="underline">ابدأ اختبارًا</Link></p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-right text-slate-500"><th className="py-1 font-normal">التاريخ</th><th className="font-normal">الأسئلة</th><th className="font-normal">النتيجة</th><th className="font-normal">المدة</th></tr></thead>
            <tbody>
              {[...p.exams].reverse().map((e) => (
                <tr key={e.at} className="border-t border-slate-100 dark:border-navy-700">
                  <td className="py-1.5">{new Date(e.at).toLocaleString('ar-SA-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td>{e.total}</td>
                  <td className="font-semibold">{pct(e.score / e.max)}</td>
                  <td>{Math.round(e.durationSec / 60)} د</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {wrong.length > 0 && (
        <section className="card space-y-2">
          <h2 className="font-bold">أسئلة تحتاج مراجعة ({wrong.length})</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">افتح بنك الأسئلة واختر الحالة «أخطأت فيها» لإعادة حلها.</p>
          <Link to="/questions" className="btn-ghost">إلى بنك الأسئلة</Link>
        </section>
      )}

      <section className="card flex flex-wrap items-center gap-2">
        <button className="btn-ghost" onClick={download}>نزّل نسخة من تقدمي (JSON)</button>
        {!confirm ? (
          <button className="btn-ghost text-rose-700" onClick={() => setConfirm(true)}>امسح تقدمي</button>
        ) : (
          <>
            <span className="text-sm">متأكد؟ لا يمكن التراجع.</span>
            <button className="btn bg-rose-600 text-white" onClick={() => { progressStore.reset(); setConfirm(false); }}>نعم، امسح</button>
            <button className="btn-ghost" onClick={() => setConfirm(false)}>إلغاء</button>
          </>
        )}
      </section>
    </div>
  );
}
