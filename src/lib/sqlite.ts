import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { createDatabase } from '../engines/sql';

let sqlPromise: Promise<SqlJsStatic> | null = null;

/** Loads the SQLite WebAssembly module once (bundled with the site, no external request). */
export function loadSql(): Promise<SqlJsStatic> {
  sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl });
  return sqlPromise;
}

/** A fresh database with the sample data; used for grading so earlier edits never affect a result. */
export async function freshDatabase(): Promise<Database> {
  return createDatabase(await loadSql());
}
