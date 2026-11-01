import initSqlJs from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { SQL_EXERCISES } from '../../content/sqlExercises';
import { compareResults, createDatabase, hasOrderBy, runQuery } from './index';

let db: ReturnType<typeof createDatabase>;
beforeAll(async () => {
  db = createDatabase(await initSqlJs());
});

describe('SQL engine', () => {
  it('runs the full example from the summary as written', () => {
    const r = runQuery(
      db,
      'SELECT last_name, salary FROM hr.employees WHERE department_id = 80 AND salary > 10000 ORDER BY salary DESC;',
    )!;
    expect(r.rows.map((x) => x[0])).toEqual(['Russell', 'Partners', 'Abel', 'Zlotkey']);
  });
  it('shows that = NULL finds nothing while IS NULL works', () => {
    expect(runQuery(db, 'SELECT * FROM employees WHERE department_id = NULL')).toBeNull();
    expect(runQuery(db, 'SELECT last_name FROM employees WHERE department_id IS NULL')!.rows).toEqual([['Grant']]);
  });
  it('translates MINUS to EXCEPT and supports dual', () => {
    expect(runQuery(db, 'SELECT department_id FROM departments MINUS SELECT department_id FROM employees')!.rows).toEqual([[190]]);
    expect(runQuery(db, 'SELECT 2 + 3 * 4 FROM dual')!.rows).toEqual([[14]]);
  });
  it('compares results ignoring column aliases and order when no ORDER BY', () => {
    const a = runQuery(db, 'SELECT last_name AS n FROM employees WHERE salary > 15000')!;
    const b = runQuery(db, 'SELECT last_name FROM employees WHERE 15000 < salary ORDER BY employee_id DESC')!;
    expect(compareResults(a, b, false).ok).toBe(true);
    expect(compareResults(a, runQuery(db, 'SELECT first_name FROM employees WHERE salary > 15000')!, false).ok).toBe(false);
  });
});

describe('every SQL exercise has a valid reference solution', () => {
  for (const ex of SQL_EXERCISES) {
    it(ex.id, () => {
      const r = runQuery(db, ex.solution);
      expect(r).not.toBeNull();
      expect(r!.rows.length).toBeGreaterThan(0);
      expect(hasOrderBy(ex.solution)).toBe(!!ex.ordered);
    });
  }
});
