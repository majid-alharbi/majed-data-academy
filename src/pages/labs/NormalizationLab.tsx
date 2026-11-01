import { useState } from 'react';
import { NormalizationTool } from '../../components/tools/NormalizationTool';

const PRESETS = [
  { label: 'جدول طلبات غير مطبّع (1NF)', attrs: 'OrderID, ProductID, Qty, Date, CustomerID, CName, City', fds: 'OrderID, ProductID -> Qty\nOrderID -> Date, CustomerID\nCustomerID -> CName, City' },
  { label: 'موظف وقسمه (2NF)', attrs: 'EmpID, Name, DeptID, DeptName', fds: 'EmpID -> Name, DeptID\nDeptID -> DeptName' },
  { label: 'طالب-مادة-مدرّس (3NF وليس BCNF)', attrs: 'Student, Course, Instructor', fds: 'Student, Course -> Instructor\nInstructor -> Course' },
  { label: 'جدول العملاء (BCNF)', attrs: 'CustomerID, Name, City', fds: 'CustomerID -> Name, City' },
];

export default function NormalizationLab() {
  const [i, setI] = useState(0);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">مختبر التطبيع</h1>
        <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">اكتب صفات الجدول والاعتمادات الوظيفية (إذا عرفت الطرف الأيسر عرفت الأيمن). يحسب المختبر المفاتيح المرشحة، ويحدد أعلى شكل طبيعي، ويشرح كل مخالفة، ويقترح تفكيكًا إلى 3NF.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p, j) => (
          <button key={p.label} onClick={() => setI(j)} className={`rounded-xl border px-3 py-2 text-sm ${i === j ? 'border-navy-400 bg-navy-700 text-white' : 'border-slate-200 bg-white dark:border-navy-600 dark:bg-navy-800'}`}>{p.label}</button>
        ))}
      </div>
      <section className="card"><NormalizationTool key={i} preset={PRESETS[i]} /></section>
      <section className="card space-y-2 text-sm leading-7">
        <p className="font-semibold">كيف يقرر المختبر؟</p>
        <ul className="list-disc space-y-1 pr-5">
          <li><strong>2NF</strong>: يفحص كل جزء من كل مفتاح مرشح مركب؛ إن حدد صفة غير أولية فهو اعتماد جزئي.</li>
          <li><strong>3NF</strong>: في كل اعتماد X → A إما أن يكون X مفتاحًا فائقًا أو تكون A صفة أولية (جزءًا من مفتاح مرشح).</li>
          <li><strong>BCNF</strong> (إثراء): كل محدِّد X مفتاح فائق.</li>
          <li>نفترض أن الجدول في 1NF (كل خانة فيها قيمة واحدة).</li>
        </ul>
      </section>
    </div>
  );
}
