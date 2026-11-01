import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { CHAPTERS, lessonQuestions, SOURCE_TITLE } from '../content';
import { useProgress } from '../lib/progress';

export default function Courses() {
  const p = useProgress();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">الفصول والدروس</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">مرتبة حسب «{SOURCE_TITLE}». كل درس: شرح، مثال، نشاط تفاعلي، أسئلة مصححة، أخطاء شائعة، ومراجعة.</p>
      </header>
      {CHAPTERS.map((c) => (
        <section key={c.id} className="card">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-700 font-bold text-white">{c.number}</span>
            <div>
              <h2 className="text-lg font-bold">{c.title}</h2>
              <p className="text-xs text-slate-500">{c.topics.join(' · ')}</p>
            </div>
          </div>
          <ol className="divide-y divide-slate-100 dark:divide-navy-700">
            {c.lessons.map((l) => {
              const done = !!p.lessons[l.id];
              return (
                <li key={l.id}>
                  <Link to={`/lesson/${l.id}`} className="flex items-center gap-3 py-3 hover:text-navy-600 dark:hover:text-white">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-navy-600'}`}>
                      {done && <Icon name="check" className="h-4 w-4" />}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">{l.title}</span>
                      <span className="block text-xs text-slate-500">{lessonQuestions(l.id).length} أسئلة · صفحات الملخص {l.sourcePages.join('، ')}</span>
                    </span>
                    <Icon name="arrow" className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
