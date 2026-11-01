import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'الرئيسية', icon: 'home' },
  { to: '/courses', label: 'الفصول', icon: 'book' },
  { to: '/labs', label: 'المختبرات', icon: 'flask' },
  { to: '/questions', label: 'بنك الأسئلة', icon: 'list' },
  { to: '/exam', label: 'الاختبار', icon: 'timer' },
  { to: '/progress', label: 'تقدمي', icon: 'chart' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-slate-200 bg-navy-800 text-white lg:flex dark:border-navy-700">
        <Brand />
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-white text-navy-800' : 'text-navy-100 hover:bg-navy-700'}`
              }
            >
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <p className="px-6 pb-6 text-xs leading-6 text-navy-200">تقدمك محفوظ في متصفحك فقط، ولا يُرسل لأي خادم.</p>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between bg-navy-800 px-4 py-3 text-white lg:hidden">
        <Brand compact />
      </header>

      <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
        <div key={pathname} className="fade-in">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden dark:border-navy-700 dark:bg-navy-900/95">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[10px] ${isActive ? 'text-navy-700 dark:text-white' : 'text-slate-400'}`
            }
          >
            <Icon name={n.icon} />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink to="/" className={`flex items-center gap-3 ${compact ? '' : 'px-6 pt-6'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white font-bold text-navy-800">M</span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-wide" dir="ltr">MAJED DATA ACADEMY</span>
        <span className="block text-xs text-navy-200">إدارة بيانات الأعمال</span>
      </span>
    </NavLink>
  );
}
