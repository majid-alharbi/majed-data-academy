import { useState } from 'react';
import { candidateKeys, closure, type FD } from '../../engines/normalization';
import { Icon } from '../Icon';
import { DataTable } from '../RelationTable';

// ---------- File system vs database ----------
export function FileVsDb() {
  const OLD = '0501111111';
  const NEW = '0502222222';
  const [changed, setChanged] = useState(false);
  const file = (title: string, phone: string, stale: boolean) => (
    <div className={`rounded-xl border p-3 text-sm ${stale ? 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40' : 'border-slate-200 dark:border-navy-700'}`}>
      <p className="mb-1 font-semibold">{title}</p>
      <p>العميل: مؤسسة النور</p>
      <p>الجوال: <span dir="ltr" className="font-mono">{phone}</span></p>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="font-semibold text-navy-700 dark:text-navy-100">نظام الملفات: نسخة لكل قسم</p>
          {file('ملف المبيعات', changed ? NEW : OLD, false)}
          {file('ملف المحاسبة', OLD, changed)}
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-navy-700 dark:text-navy-100">قاعدة البيانات: نسخة واحدة مشتركة</p>
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="mb-1 font-semibold">جدول Customer (يقرؤه الجميع)</p>
            <p>الجوال: <span dir="ltr" className="font-mono">{changed ? NEW : OLD}</span></p>
          </div>
          <p className="text-xs text-slate-500">المبيعات والمحاسبة تقرآن الصف نفسه.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={changed} onClick={() => setChanged(true)}>العميل غيّر جواله عند المبيعات</button>
        <button className="btn-ghost" onClick={() => setChanged(false)}><Icon name="reset" className="h-4 w-4" />من جديد</button>
      </div>
      {changed && <p className="text-sm leading-7">في نظام الملفات أصبح للعميل رقمان مختلفان (<strong>تضارب</strong>) لأن المعلومة كانت مخزنة مرتين (<strong>تكرار</strong>). في قاعدة البيانات عُدّلت قيمة واحدة فرآها الجميع.</p>}
    </div>
  );
}

// ---------- Three levels ----------
const LEVELS = [
  { id: 'ext', name: 'الخارجي', q: 'ماذا يرى كل مستخدم؟', ex: 'شاشة العميل: رصيده فقط · شاشة الموظف: عملاء فرعه' },
  { id: 'con', name: 'المفاهيمي', q: 'ماذا نخزن؟', ex: 'جداول Customer و Account و Transaction والعلاقات بينها' },
  { id: 'int', name: 'الداخلي', q: 'كيف نخزن؟', ex: 'ملفات البيانات على الأقراص، الفهارس، الضغط' },
];
const CHANGES = [
  { label: 'إضافة عمود Email لجدول العملاء', at: 'con', safe: 'ext', kind: 'استقلالية منطقية', why: 'تغيّر المستوى المفاهيمي، وبقيت شاشات المستخدمين تعمل كما هي.' },
  { label: 'إضافة فهرس على رقم الحساب', at: 'int', safe: 'con', kind: 'استقلالية فيزيائية', why: 'تغيّرت طريقة التخزين، وبقيت الجداول نفسها كما هي.' },
  { label: 'نقل الملفات إلى قرص أسرع', at: 'int', safe: 'con', kind: 'استقلالية فيزيائية', why: 'تغيير في التخزين فقط، لا يشعر به المستوى المفاهيمي.' },
  { label: 'إضافة جدول للبطاقات الائتمانية', at: 'con', safe: 'ext', kind: 'استقلالية منطقية', why: 'جدول جديد في المفاهيمي دون تعديل واجهات المستخدمين الحالية.' },
];
export function Levels() {
  const [c, setC] = useState<number | null>(null);
  const change = c === null ? null : CHANGES[c];
  return (
    <div className="space-y-4">
      <p className="font-semibold">اختر تغييرًا، وشاهد أين يحدث ومن الذي لا يتأثر به:</p>
      <div className="flex flex-wrap gap-2">
        {CHANGES.map((x, i) => (
          <button key={x.label} onClick={() => setC(i)} className={`rounded-lg border px-3 py-1.5 text-sm ${c === i ? 'border-navy-400 bg-navy-50 dark:bg-navy-700' : 'border-slate-200 dark:border-navy-600'}`}>{x.label}</button>
        ))}
      </div>
      <div className="space-y-2">
        {LEVELS.map((l) => {
          const state = change?.at === l.id ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40' : change?.safe === l.id ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-navy-700';
          return (
            <div key={l.id} className={`rounded-xl border-2 p-3 transition-colors ${state}`}>
              <p className="font-semibold">المستوى {l.name} <span className="font-normal text-slate-500">— {l.q}</span></p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{l.ex}</p>
              {change?.at === l.id && <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">هنا حدث التغيير</p>}
              {change?.safe === l.id && <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">لم يتأثر ✓</p>}
            </div>
          );
        })}
      </div>
      {change && <p className="text-sm"><strong>{change.kind}</strong>: {change.why}</p>}
    </div>
  );
}

// ---------- Table anatomy ----------
const BASE_COLS = ['EmpID', 'Name', 'City'];
const EXTRA_COLS = ['Salary', 'DeptID', 'Email'];
const BASE_ROWS: (string | number)[][] = [
  [101, 'Ahmed', 'Abha', 9000, 20, 'ahmed@co.sa'],
  [102, 'Sara', 'Riyadh', 12000, 10, 'sara@co.sa'],
  [103, 'Khalid', 'Abha', 6500, 20, 'khalid@co.sa'],
  [104, 'Noura', 'Jeddah', 7000, 30, 'noura@co.sa'],
  [105, 'Fahad', 'Riyadh', 15000, 10, 'fahad@co.sa'],
];
export function TableAnatomy() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const names = [...BASE_COLS, ...EXTRA_COLS].slice(0, cols);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-navy-700 p-3 text-center text-white"><p className="text-xs">Degree (عدد الأعمدة)</p><p className="text-3xl font-bold">{cols}</p></div>
        <div className="rounded-xl bg-navy-100 p-3 text-center text-navy-800"><p className="text-xs">Cardinality (عدد الصفوف)</p><p className="text-3xl font-bold">{rows}</p></div>
      </div>
      <DataTable columns={names} rows={BASE_ROWS.slice(0, rows).map((r) => r.slice(0, cols))} caption="Relation: Employee — كل صف Tuple وكل عمود Attribute" />
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" disabled={rows >= BASE_ROWS.length} onClick={() => setRows(rows + 1)}>+ صف (Tuple)</button>
        <button className="btn-ghost" disabled={rows <= 1} onClick={() => setRows(rows - 1)}>− صف</button>
        <button className="btn-ghost" disabled={cols >= 6} onClick={() => setCols(cols + 1)}>+ عمود (Attribute)</button>
        <button className="btn-ghost" disabled={cols <= 1} onClick={() => setCols(cols - 1)}>− عمود</button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">لاحظ: إضافة صف تغيّر Cardinality فقط، وإضافة عمود تغيّر Degree فقط.</p>
    </div>
  );
}

// ---------- Keys ----------
const KEY_ATTRS = ['EmpID', 'NationalID', 'Email', 'Name', 'DeptID'];
const KEY_FDS: FD[] = [
  { lhs: ['EmpID'], rhs: ['NationalID', 'Email', 'Name', 'DeptID'] },
  { lhs: ['NationalID'], rhs: ['EmpID'] },
  { lhs: ['Email'], rhs: ['EmpID'] },
];
export function KeysExplorer() {
  const [sel, setSel] = useState<string[]>(['EmpID', 'Name']);
  const cands = candidateKeys(KEY_ATTRS, KEY_FDS);
  const isSuper = KEY_ATTRS.every((a) => closure(sel, KEY_FDS).includes(a));
  const isCand = cands.some((k) => k.length === sel.length && k.every((a) => sel.includes(a)));
  const verdict = !sel.length ? 'اختر عمودًا أو أكثر' : isCand ? (sel[0] === 'EmpID' && sel.length === 1 ? 'مفتاح مرشح، واخترناه مفتاحًا أساسيًا' : 'مفتاح مرشح (بديل لأننا اخترنا EmpID أساسيًا)') : isSuper ? 'مفتاح فائق، لكنه ليس مرشحًا لأن فيه أعمدة زائدة' : 'ليس مفتاحًا: قد يتكرر بين موظفين';
  return (
    <div className="space-y-4">
      <p className="text-sm">في <code className="code-inline">Employee(EmpID, NationalID, Email, Name, DeptID)</code>: رقم الموظف ورقم الهوية والإيميل لا تتكرر، والاسم والقسم قد يتكرران. اختر مجموعة أعمدة:</p>
      <div className="flex flex-wrap gap-2" dir="ltr">
        {KEY_ATTRS.map((a) => (
          <button key={a} onClick={() => setSel(sel.includes(a) ? sel.filter((x) => x !== a) : [...sel, a])} className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${sel.includes(a) ? 'border-navy-400 bg-navy-700 text-white' : 'border-slate-200 dark:border-navy-600'}`}>{a}</button>
        ))}
      </div>
      <div className={`rounded-xl border-2 p-4 ${isCand ? 'border-emerald-400' : isSuper ? 'border-amber-400' : 'border-slate-200 dark:border-navy-700'}`}>
        <p dir="ltr" className="text-left font-mono">{`{${sel.join(', ')}}`}</p>
        <p className="mt-1 font-semibold">{verdict}</p>
      </div>
      <p className="text-xs text-slate-500">المفاتيح المرشحة هنا: {cands.map((k) => k.join('+')).join('، ')}. و DeptID مفتاح أجنبي يشير إلى Department.</p>
    </div>
  );
}

// ---------- Referential actions ----------
type Policy = 'restrict' | 'cascade' | 'setnull';
const DEPTS = [[10, 'Sales'], [20, 'IT'], [30, 'HR']] as (string | number)[][];
const EMPS = [[101, 'Ahmed', 20], [102, 'Sara', 10], [103, 'Khalid', 20], [104, 'Noura', 30]] as (string | number | null)[][];
export function Integrity() {
  const [policy, setPolicy] = useState<Policy>('restrict');
  const [deleted, setDeleted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const reset = () => { setDeleted(false); setMsg(null); };
  const del = () => {
    if (policy === 'restrict') {
      setMsg('Restrict: رُفض الحذف لأن موظفَين (Ahmed و Khalid) مرتبطان بالقسم 20.');
      return;
    }
    setDeleted(true);
    setMsg(policy === 'cascade' ? 'Cascade: حُذف القسم 20 وحُذف معه الموظفان المرتبطان به.' : 'Set NULL: حُذف القسم 20 وبقي الموظفان، وأصبح DeptID عندهما NULL.');
  };
  const depts = deleted ? DEPTS.filter((d) => d[0] !== 20) : DEPTS;
  const emps = !deleted ? EMPS : policy === 'cascade' ? EMPS.filter((e) => e[2] !== 20) : EMPS.map((e) => (e[2] === 20 ? [e[0], e[1], null] : e));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['restrict', 'cascade', 'setnull'] as Policy[]).map((p) => (
          <button key={p} onClick={() => { setPolicy(p); reset(); }} className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${policy === p ? 'border-navy-400 bg-navy-700 text-white' : 'border-slate-200 dark:border-navy-600'}`}>{p === 'restrict' ? 'Restrict' : p === 'cascade' ? 'Cascade' : 'Set NULL'}</button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DataTable columns={['DeptID', 'DeptName']} rows={depts} caption="Department" />
        <DataTable columns={['EmpID', 'Name', 'DeptID (FK)']} rows={emps} caption="Employee" />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={deleted} onClick={del}>احذف القسم 20 (IT)</button>
        <button className="btn-ghost" onClick={() => setMsg('التكامل المرجعي: رُفض الإدخال لأن القسم 99 غير موجود في جدول Department.')}>أدخل موظفًا في القسم 99</button>
        <button className="btn-ghost" onClick={() => setMsg('تكامل الكيان: رُفض الإدخال لأن EmpID = 101 موجود مسبقًا (المفتاح الأساسي لا يتكرر).')}>أدخل موظفًا برقم 101</button>
        <button className="btn-ghost" onClick={reset}><Icon name="reset" className="h-4 w-4" />من جديد</button>
      </div>
      {msg && <p className="rounded-xl bg-navy-50 p-3 text-sm dark:bg-navy-900">{msg}</p>}
    </div>
  );
}
