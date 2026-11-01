import { SAMPLE_TABLES } from '../../content/sampleDb';
import type { Database } from './evaluate';
import { makeRelation } from './relation';

export * from './relation';
export * from './parser';
export * from './evaluate';

export function sampleDatabase(): Database {
  const db: Database = {};
  for (const t of SAMPLE_TABLES) db[t.name] = makeRelation(t.name, t.columns.map((c) => c.name), t.rows);
  return db;
}
