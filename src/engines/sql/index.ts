// In-browser SQL runner. The course uses Oracle SQL; the browser engine is SQLite (sql.js),
// so a few Oracle spellings are translated before running and the differences are stated in the UI.

import type { Database as SqlDatabase, SqlJsStatic } from 'sql.js';
import { HR_TABLES } from '../../content/hrDb';
import { SAMPLE_TABLES, type TableDef } from '../../content/sampleDb';

export type Cell = string | number | null | Uint8Array;

export interface QueryResult {
  columns: string[];
  rows: Cell[][];
}

export const ALL_TABLES: TableDef[] = [...SAMPLE_TABLES, ...HR_TABLES];

const literal = (v: unknown) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

export function schemaScript(tables: TableDef[] = ALL_TABLES): string {
  const parts: string[] = ['CREATE TABLE dual (dummy VARCHAR2(1));', "INSERT INTO dual VALUES ('X');"];
  for (const t of tables) {
    const pk = t.columns.filter((c) => c.pk).map((c) => c.name);
    const cols = t.columns.map((c) => `${c.name} ${c.sqlType}`);
    if (pk.length) cols.push(`PRIMARY KEY (${pk.join(', ')})`);
    parts.push(`CREATE TABLE ${t.name} (${cols.join(', ')});`);
    for (const r of t.rows) parts.push(`INSERT INTO ${t.name} VALUES (${r.map(literal).join(', ')});`);
  }
  return parts.join('\n');
}

/** Translate common Oracle spellings that SQLite does not understand. */
export function oracleToSqlite(sql: string): string {
  return sql
    .replace(/\bhr\./gi, '')
    .replace(/\bMINUS\b/gi, 'EXCEPT')
    .replace(/\bSYSDATE\b/gi, "DATE('now')")
    .replace(/\bNVL\s*\(/gi, 'IFNULL(');
}

export function createDatabase(SQL: SqlJsStatic): SqlDatabase {
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run('PRAGMA case_sensitive_like = ON;'); // Oracle's LIKE is case-sensitive
  db.exec(schemaScript());
  return db;
}

/** Runs all statements; returns the result of the last statement that produced rows. */
export function runQuery(db: SqlDatabase, sql: string): QueryResult | null {
  const results = db.exec(oracleToSqlite(sql));
  const last = results[results.length - 1];
  return last ? { columns: last.columns, rows: last.values as Cell[][] } : null;
}

const norm = (v: Cell) => (v instanceof Uint8Array ? '[blob]' : typeof v === 'number' ? Number(v.toFixed(6)) : v);

export interface Comparison {
  ok: boolean;
  message: string;
}

/**
 * Compares a student's result with the expected result. Column names are ignored (aliases may differ),
 * column count and values must match. Order matters only when the expected query has ORDER BY.
 */
export function compareResults(actual: QueryResult | null, expected: QueryResult, ordered: boolean): Comparison {
  // sql.js returns no result set both for non-SELECT statements and for SELECTs with zero rows.
  if (!actual) return { ok: false, message: `نتيجتك فارغة (0 صفوف) والمتوقع ${expected.rows.length} صفوف. راجع الشرط، وتذكّر أن NULL يُفحص بـ IS NULL.` };
  if (actual.columns.length !== expected.columns.length) {
    return { ok: false, message: `عدد الأعمدة في نتيجتك ${actual.columns.length} والمتوقع ${expected.columns.length}` };
  }
  if (actual.rows.length !== expected.rows.length) {
    return { ok: false, message: `عدد الصفوف في نتيجتك ${actual.rows.length} والمتوقع ${expected.rows.length}` };
  }
  const key = (r: Cell[]) => JSON.stringify(r.map(norm));
  const a = actual.rows.map(key);
  const e = expected.rows.map(key);
  if (ordered) {
    const sameSet = [...a].sort().join('|') === [...e].sort().join('|');
    if (a.join('|') === e.join('|')) return { ok: true, message: 'إجابة صحيحة: النتيجة والترتيب مطابقان' };
    return { ok: false, message: sameSet ? 'الصفوف صحيحة لكن الترتيب غير مطابق؛ راجع ORDER BY' : 'القيم في نتيجتك لا تطابق المتوقع' };
  }
  return [...a].sort().join('|') === [...e].sort().join('|')
    ? { ok: true, message: 'إجابة صحيحة: النتيجة مطابقة' }
    : { ok: false, message: 'القيم في نتيجتك لا تطابق المتوقع' };
}

export const hasOrderBy = (sql: string) => /\border\s+by\b/i.test(sql);

export function translateSqlError(msg: string): string {
  const m = msg.replace(/^Error:\s*/, '');
  if (/no such table: (\w+)/i.test(m)) return `الجدول «${m.match(/no such table: (\w+)/i)![1]}» غير موجود. ${m}`;
  if (/no such column: ([\w.]+)/i.test(m)) return `العمود «${m.match(/no such column: ([\w.]+)/i)![1]}» غير موجود؛ تأكد من الاسم وعلامات الاقتباس حول النصوص. ${m}`;
  if (/syntax error/i.test(m)) return `خطأ في صياغة الجملة. ${m}`;
  if (/UNIQUE constraint failed|PRIMARY KEY/i.test(m)) return `انتهاك قيد المفتاح الأساسي (تكامل الكيان): القيمة مكررة. ${m}`;
  if (/FOREIGN KEY constraint failed/i.test(m)) return `انتهاك التكامل المرجعي: القيمة غير موجودة في الجدول الآخر. ${m}`;
  return m;
}
