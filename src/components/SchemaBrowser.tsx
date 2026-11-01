import { useState } from 'react';
import type { TableDef } from '../content/sampleDb';
import { DataTable } from './RelationTable';

/** Lists the practice tables; click a table to preview its rows. */
export function SchemaBrowser({ tables }: { tables: TableDef[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const t = tables.find((x) => x.name === open);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" dir="ltr">
        {tables.map((x) => (
          <button key={x.name} onClick={() => setOpen(open === x.name ? null : x.name)} className={`rounded-lg border px-3 py-1.5 text-left font-mono text-xs ${open === x.name ? 'border-navy-400 bg-navy-700 text-white' : 'border-slate-200 hover:bg-navy-50 dark:border-navy-600 dark:hover:bg-navy-700'}`}>
            <span className="font-bold">{x.name}</span>({x.columns.map((c) => (c.pk ? `${c.name}*` : c.name)).join(', ')})
          </button>
        ))}
      </div>
      {t && <DataTable columns={t.columns.map((c) => c.name)} rows={t.rows} caption={`${t.description} — ${t.rows.length} صفوف (النجمة * = مفتاح أساسي)`} />}
    </div>
  );
}
