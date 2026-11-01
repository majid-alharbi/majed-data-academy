import initSqlJs from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { evaluate, sampleDatabase } from '../engines/algebra';
import { ERD_EXAMPLES } from '../engines/erd/examples';
import { mapErdToRm } from '../engines/erd/model';
import { analyze, parseAttributes, parseFDs } from '../engines/normalization';
import { createDatabase, runQuery } from '../engines/sql';
import { CHAPTERS, LESSONS, QUESTIONS } from './index';

let sqlDb: ReturnType<typeof createDatabase>;
beforeAll(async () => {
  sqlDb = createDatabase(await initSqlJs());
});
const ra = sampleDatabase();

describe('course structure', () => {
  it('covers the five chapters of the summary plus the review', () => {
    expect(CHAPTERS.map((c) => c.id)).toEqual(['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'review']);
  });
  it('every lesson has all learning stages and cites summary pages 1–10', () => {
    for (const l of LESSONS) {
      expect(l.explain.length, l.id).toBeGreaterThan(0);
      expect(l.simpler.length, l.id).toBeGreaterThan(0);
      expect(l.example.blocks.length, l.id).toBeGreaterThan(0);
      expect(l.mistakes.length, l.id).toBeGreaterThan(0);
      expect(l.review.length, l.id).toBeGreaterThan(0);
      expect(l.sourcePages.every((p) => p >= 1 && p <= 10), l.id).toBe(true);
    }
  });
  it('every lesson has at least 3 questions', () => {
    for (const l of LESSONS) expect(QUESTIONS.filter((q) => q.lessonId === l.id).length, l.id).toBeGreaterThanOrEqual(3);
  });
});

describe('question bank integrity', () => {
  it('ids are unique and lessons exist', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of QUESTIONS) expect(LESSONS.some((l) => l.id === q.lessonId && l.chapterId === q.chapterId), q.id).toBe(true);
  });
  it('choice questions have a valid answer and no duplicate options', () => {
    for (const q of QUESTIONS) {
      if (q.type !== 'choice') continue;
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, q.id).toBe(q.options.length);
    }
  });
  it('relational-algebra answers evaluate to non-empty relations', () => {
    for (const q of QUESTIONS) if (q.type === 'ra') expect(evaluate(q.expected, ra).relation.rows.length, q.id).toBeGreaterThan(0);
  });
  it('SQL answers run and return rows', () => {
    for (const q of QUESTIONS) if (q.type === 'sql') expect(runQuery(sqlDb, q.expected)?.rows.length ?? 0, q.id).toBeGreaterThan(0);
  });
});

describe('lesson activities are runnable', () => {
  it('RA presets, ERD examples, normalization presets and SQL presets', () => {
    for (const l of LESSONS) {
      const a = l.activity;
      if (a.widget === 'ra') for (const p of a.presets) expect(() => evaluate(p.expr, ra), p.expr).not.toThrow();
      if (a.widget === 'erd' || a.widget === 'mapping') {
        const ex = ERD_EXAMPLES.find((e) => e.id === a.example);
        expect(ex, l.id).toBeDefined();
        expect(mapErdToRm(ex!.model).length).toBeGreaterThan(0);
      }
      if (a.widget === 'normalization') {
        const attrs = parseAttributes(a.preset.attrs);
        expect(analyze(attrs, parseFDs(a.preset.fds, attrs)).normalForm).toBe('1NF');
      }
      if (a.widget === 'sql') for (const p of a.presets) expect(() => runQuery(sqlDb, p.sql), p.label).not.toThrow();
      if (a.widget === 'classify') for (const i of a.items) expect(i.bucket).toBeLessThan(a.buckets.length);
    }
  });
});
