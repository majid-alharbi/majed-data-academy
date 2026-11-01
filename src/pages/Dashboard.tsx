import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { ProgressBar } from '../components/ProgressBar';
import { CHAPTERS, LESSONS, QUESTIONS, SOURCE_TITLE } from '../content';
import { useProgress } from '../lib/progress';
import { chapterStats, overallStats } from '../lib/stats';

const LABS: { to: string; title: string; desc: string; icon: IconName }[] = [
  { to: '/labs/algebra', title: 'مختبر الجبر العلائقي', desc: 'σ و π و ⋈ وغيرها على بيانات حقيقية', icon: 'flask' },
  { to: '/labs/sql', title: 'مختبر SQL', desc: 'محرر وتمارين تُصحَّح تلقائيًا', icon: 'db' },
  { to: '/labs/erd', title: 'مختبر ERD والتحويل', desc: 'مخططات تفاعلية وتحويلها إلى جداول', icon: 'book' },
  { to: '/labs/normalization', title: 'مختبر التطبيع', desc: 'مفاتيح، اعتمادات، 2NF و 3NF', icon: 'list' },
];

export default function Dashboard() {
  const p = useProgress();
  const s = overallStats(p);
  const next = LESSONS.find((l) => !p.lessons[l.id]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-navy-800 p-6 text-white sm:p-10">
        <p className="text-sm text-navy-200" dir="ltr">MAJED DATA ACADEMY</p>
        <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-4xl">تعلّم إدارة بيانات الأعمال بالتجربة، لا بالحفظ</h1>
        <p className="mt-3 max-w-2xl leading-8 text-navy-100">افهم ← شاهد ← جرّب ← طبّق ← اختبر ← صحّح ← راجع. كل درس مبني على «{SOURCE_TITLE}»، مع مختبرات تعمل داخل متصفحك.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {next ? (
            <Link to={`/lesson/${next.id}`} className="btn bg-white text-navy-800 hover:bg-navy-50">
              {s.lessonsDone ? 'تابع' : 'ابدأ'}: {next.title}
            </Link>
          ) : (
            <Link to="/exam" className="btn bg-white text-navy-800 hover:bg-navy-50">أنهيت الدروس — جرّب الاختبار</Link>
          )}
          <Link to="/labs/algebra" className="btn border border-navy-400 text-white hover:bg-navy-700">افتح مختبر الجبر العلائقي</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['الدروس المكتملة', `${s.lessonsDone} / ${s.lessonsTotal}`],
          ['أسئلة أجبت عنها', `${s.answered} / ${s.questionsTotal}`],
          ['إجابات صحيحة', String(s.correct)],
          ['اختبارات منجزة', String(s.exams)],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="mt-1 text-2xl font-bold text-navy-700 dark:text-white">{v}</p>
          </div>
        ))}
      </section>
      {s.answered === 0 && s.lessonsDone === 0 && <p className="-mt-5 text-xs text-slate-500">الأرقام تبدأ من الصفر وتتحدث مع كل درس تكمله وكل سؤال تجيب عنه.</p>}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">الفصول</h2>
          <Link to="/courses" className="text-sm text-navy-600 hover:underline dark:text-navy-200">كل الدروس</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {CHAPTERS.map((c) => {
            const st = chapterStats(p, c.id);
            return (
              <Link key={c.id} to={`/lesson/${c.lessons[0].id}`} className="card block transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-700 font-bold text-white">{c.number}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{c.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{c.description}</p>
                    <div className="mt-3"><ProgressBar value={st.lessonsDone / st.lessonsTotal} label={`تقدم ${c.title}`} /></div>
                    <p className="mt-1 text-xs text-slate-500">{st.lessonsDone} من {st.lessonsTotal} دروس · {st.questionsTotal} سؤالًا</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">المختبرات التفاعلية</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LABS.map((l) => (
            <Link key={l.to} to={l.to} className="card block p-4 transition-shadow hover:shadow-md">
              <Icon name={l.icon} className="h-6 w-6 text-navy-600 dark:text-navy-200" />
              <p className="mt-2 font-bold">{l.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-slate-500">{QUESTIONS.length} سؤالًا مراجعًا · {LESSONS.length} درسًا · منصة مجانية مفتوحة المصدر</p>
    </div>
  );
}
