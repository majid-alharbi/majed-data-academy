import type { Relation } from '../engines/algebra';
import { columnNames } from '../engines/algebra';

type Cell = string | number | null | Uint8Array;

export function DataTable({ columns, rows, caption, max = 50 }: { columns: string[]; rows: Cell[][]; caption?: string; max?: number }) {
  return (
    <div dir="ltr" className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-700">
      {caption && <div className="border-b border-slate-200 bg-navy-50 px-3 py-1.5 text-right text-xs font-semibold text-navy-700 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100" dir="rtl">{caption}</div>}
      <table className="w-full font-mono text-xs sm:text-sm">
        <thead className="bg-slate-50 dark:bg-navy-800">
          <tr>{columns.map((c, i) => <th key={i} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-navy-700 dark:text-navy-100">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, max).map((r, i) => (
            <tr key={i} className="border-t border-slate-100 dark:border-navy-800">
              {r.map((v, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-1.5">
                  {v === null ? <span className="italic text-slate-400">NULL</span> : v instanceof Uint8Array ? '[blob]' : String(v)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-3 text-center text-slate-400" dir="rtl">لا توجد صفوف (نتيجة فارغة)</td></tr>
          )}
        </tbody>
      </table>
      {rows.length > max && <div className="px-3 py-1 text-right text-xs text-slate-500" dir="rtl">يُعرض أول {max} صفًا من {rows.length}</div>}
    </div>
  );
}

export function RelationTable({ relation, caption }: { relation: Relation; caption?: string }) {
  return <DataTable columns={columnNames(relation)} rows={relation.rows} caption={caption} />;
}
