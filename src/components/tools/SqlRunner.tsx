import type { Database } from 'sql.js';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { runQuery, translateSqlError, type QueryResult } from '../../engines/sql';
import { progressStore } from '../../lib/progress';
import { freshDatabase } from '../../lib/sqlite';
import { Icon } from '../Icon';
import { DataTable } from '../RelationTable';

export function useSqlSession() {
  const db = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const reset = async () => {
    db.current?.close();
    db.current = await freshDatabase();
    setReady(true);
  };
  useEffect(() => {
    reset().catch((e) => setLoadError(String(e)));
    return () => db.current?.close();
  }, []);
  return { db, ready, loadError, reset };
}

export const SQLITE_NOTE =
  'يعمل المحرر على محرك SQLite داخل متصفحك. تُترجم تلقائيًا: hr. و MINUS و NVL و SYSDATE. بعض خصائص Oracle (مثل ROWNUM وأنواع التاريخ المتقدمة) غير مدعومة هنا.';

/** Run SQL against a private in-browser database; `editor` lets the lab swap in Monaco. */
export function SqlRunner({ presets, initial, editor }: {
  presets?: { label: string; sql: string }[];
  initial?: string;
  editor?: (value: string, onChange: (v: string) => void, run: () => void) => ReactNode;
}) {
  const { db, ready, loadError, reset } = useSqlSession();
  const [sql, setSql] = useState(initial ?? presets?.[0]?.sql ?? 'SELECT * FROM employees;');
  const [result, setResult] = useState<QueryResult | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const run = (src = sql) => {
    if (!db.current) return;
    try {
      setResult(runQuery(db.current, src));
      setError(null);
      progressStore.recordLab('sql');
    } catch (e) {
      setResult(undefined);
      setError(translateSqlError(String(e)));
    }
  };

  return (
    <div className="space-y-3">
      {presets && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} className="chip cursor-pointer hover:bg-navy-100 dark:hover:bg-navy-600" onClick={() => setSql(p.sql)}>{p.label}</button>
          ))}
        </div>
      )}
      {editor ? (
        editor(sql, setSql, () => run())
      ) : (
        <textarea
          dir="ltr"
          rows={5}
          spellCheck={false}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } }}
          className="input font-mono"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" disabled={!ready} onClick={() => run()}><Icon name="play" className="h-4 w-4" />{ready ? 'شغّل' : 'جارٍ تحميل المحرك…'}</button>
        <button className="btn-ghost" disabled={!ready} onClick={() => { reset(); setResult(undefined); setError(null); }}><Icon name="reset" className="h-4 w-4" />أعد البيانات الأصلية</button>
      </div>
      {loadError && <p className="text-sm text-rose-700">تعذّر تحميل محرك SQL: {loadError}</p>}
      {error && <p dir="auto" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {result === null && <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-navy-900">نُفّذ الأمر ولم يُرجع جدولًا (أو أرجع 0 صفوف).</p>}
      {result && <DataTable columns={result.columns} rows={result.rows} caption={`${result.rows.length} صفوف`} />}
      <p className="text-xs leading-6 text-slate-500">{SQLITE_NOTE}</p>
    </div>
  );
}
