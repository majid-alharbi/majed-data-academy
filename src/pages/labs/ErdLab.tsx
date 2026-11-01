import { useState } from 'react';
import { ErdLegend } from '../../components/erd/ErdDiagram';
import { MappingView } from '../../components/tools/MappingView';
import { ERD_EXAMPLES } from '../../engines/erd/examples';

export default function ErdLab() {
  const [id, setId] = useState(ERD_EXAMPLES[0].id);
  const ex = ERD_EXAMPLES.find((e) => e.id === id)!;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">مختبر ERD والتحويل إلى جداول</h1>
        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">اختر حالة، اقرأ المتطلبات، تأمل المخطط (يمكنك سحب العناصر والتكبير)، ثم حدد أين يُمثَّل كل ربط قبل أن تكشف النموذج العلائقي.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {ERD_EXAMPLES.map((e) => (
          <button key={e.id} onClick={() => setId(e.id)} className={`rounded-xl border px-4 py-2 text-sm ${id === e.id ? 'border-navy-400 bg-navy-700 text-white' : 'border-slate-200 bg-white dark:border-navy-600 dark:bg-navy-800'}`}>{e.title}</button>
        ))}
      </div>
      <section className="card space-y-4">
        <ErdLegend />
        <MappingView key={ex.id} example={ex} />
      </section>
      <section className="card text-sm leading-7">
        <p className="font-semibold">ملاحظة حول علاقة 1:1</p>
        <p>يضع المختبر المفتاح الأجنبي في جهة المشاركة الإلزامية (القاعدة المرجعية في Elmasri & Navathe). ورد في الملخص «الطرف الاختياري»؛ راجع أستاذ المقرر إن اختلف المطلوب في اختبارك.</p>
      </section>
    </div>
  );
}
