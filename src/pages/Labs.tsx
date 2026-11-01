import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { useProgress } from '../lib/progress';

const LABS: { to: string; key: string; title: string; desc: string; icon: IconName; items: string[] }[] = [
  { to: '/labs/algebra', key: 'algebra', title: 'الجبر العلائقي', icon: 'flask', desc: 'اكتب تعبيرًا بالرموز σ π ∪ − ∩ × ⋈ ρ وشاهد النتيجة وكل خطوة وسيطة.', items: ['محلل تعبيرات حقيقي برسائل أخطاء عربية', 'عرض التعبير بصيغة رياضية (KaTeX)', 'تمارين تُصحَّح بمقارنة النتيجة'] },
  { to: '/labs/sql', key: 'sql', title: 'Oracle SQL', icon: 'db', desc: 'محرر Monaco وقاعدة بيانات تعمل داخل المتصفح مع تمارين تُصحَّح تلقائيًا.', items: ['جداول HR المبسطة وجداول المتجر', 'تصحيح بمقارنة نتيجتك بالنتيجة المتوقعة', 'زر لإعادة البيانات الأصلية'] },
  { to: '/labs/erd', key: 'erd', title: 'ERD والتحويل إلى جداول', icon: 'book', desc: 'مخططات Chen تفاعلية لأربع حالات، وتدريب على قواعد التحويل، والنموذج العلائقي الناتج.', items: ['كيانات ضعيفة، خصائص مركبة ومتعددة القيم ومشتقة', 'علاقات 1:1 و 1:N و N:M ودائرية وثلاثية', 'تحويل آلي مع تعليل كل قاعدة'] },
  { to: '/labs/normalization', key: 'normalization', title: 'التطبيع', icon: 'list', desc: 'أدخل الصفات والاعتمادات الوظيفية لتحصل على المفاتيح والشكل الطبيعي والتفكيك إلى 3NF.', items: ['الإغلاق X⁺ والمفاتيح المرشحة', 'كشف مخالفات 2NF و 3NF و BCNF', 'تفكيك 3NF آلي'] },
];

export default function Labs() {
  const p = useProgress();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">المختبرات التفاعلية</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">كل المختبرات تعمل داخل متصفحك دون خادم أو تسجيل.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {LABS.map((l) => (
          <Link key={l.to} to={l.to} className="card block transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-700 text-white"><Icon name={l.icon} /></span>
              <h2 className="text-lg font-bold">{l.title}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{l.desc}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {l.items.map((i) => <li key={i} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-emerald-600" />{i}</li>)}
            </ul>
            {(p.labs[l.key] ?? 0) > 0 && <p className="mt-3 text-xs text-slate-500">استخدمته {p.labs[l.key]} مرة</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
