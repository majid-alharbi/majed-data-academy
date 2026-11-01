import type { Question } from '../content/types';
import { AlgebraError, evaluate, relationsEqual, sampleDatabase, type Relation } from '../engines/algebra';
import { compareResults, hasOrderBy, runQuery, translateSqlError, type QueryResult } from '../engines/sql';
import { freshDatabase } from './sqlite';

export interface StudentResponse {
  choice?: number;
  tf?: boolean;
  text?: string;
  rubric?: boolean[];
}

export interface Graded {
  correct: boolean;
  /** 0–1. Objective questions are 0 or 1; essays are the share of rubric items met. */
  score: number;
  message: string;
  selfAssessed?: boolean;
  relation?: Relation;
  table?: QueryResult | null;
}

const raDb = sampleDatabase();

export function isAnswered(q: Question, r: StudentResponse): boolean {
  switch (q.type) {
    case 'choice': return r.choice !== undefined;
    case 'tf': return r.tf !== undefined;
    case 'essay': return !!r.rubric;
    default: return !!r.text?.trim();
  }
}

export async function grade(q: Question, r: StudentResponse): Promise<Graded> {
  switch (q.type) {
    case 'choice': {
      const ok = r.choice === q.answer;
      return { correct: ok, score: ok ? 1 : 0, message: ok ? 'إجابة صحيحة' : `الإجابة الصحيحة: ${q.options[q.answer]}` };
    }
    case 'tf': {
      const ok = r.tf === q.answer;
      return { correct: ok, score: ok ? 1 : 0, message: ok ? 'إجابة صحيحة' : `الإجابة الصحيحة: ${q.answer ? 'صح' : 'خطأ'}` };
    }
    case 'essay': {
      const met = (r.rubric ?? []).filter(Boolean).length;
      const score = q.rubric.length ? met / q.rubric.length : 0;
      return { correct: score >= 0.75, score, selfAssessed: true, message: `تقييم ذاتي: حققت ${met} من ${q.rubric.length} عناصر` };
    }
    case 'ra': {
      try {
        const mine = evaluate(r.text ?? '', raDb).relation;
        const expected = evaluate(q.expected, raDb).relation;
        const ok = relationsEqual(mine, expected);
        return {
          correct: ok,
          score: ok ? 1 : 0,
          relation: mine,
          message: ok
            ? 'نتيجة تعبيرك مطابقة للمطلوب على بيانات المنصة'
            : `نتيجة تعبيرك (${mine.rows.length} صفوف) لا تطابق المطلوب (${expected.rows.length} صفوف). تأكد من الشرط وأسماء الأعمدة المطلوبة.`,
        };
      } catch (e) {
        return { correct: false, score: 0, message: e instanceof AlgebraError ? e.message : String(e) };
      }
    }
    case 'sql': {
      const db = await freshDatabase();
      try {
        const expected = runQuery(db, q.expected)!;
        let mine: QueryResult | null;
        try {
          mine = runQuery(db, r.text ?? '');
        } catch (e) {
          return { correct: false, score: 0, message: translateSqlError(String(e)) };
        }
        const c = compareResults(mine, expected, hasOrderBy(q.expected));
        return { correct: c.ok, score: c.ok ? 1 : 0, message: c.message, table: mine };
      } finally {
        db.close();
      }
    }
  }
}
