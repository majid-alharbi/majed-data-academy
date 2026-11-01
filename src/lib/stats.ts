import { CHAPTERS, LESSONS, QUESTIONS } from '../content';
import type { Progress } from './progress';

export function chapterStats(p: Progress, chapterId: string) {
  const ch = CHAPTERS.find((c) => c.id === chapterId)!;
  const qs = QUESTIONS.filter((q) => q.chapterId === chapterId);
  const answered = qs.filter((q) => p.answers[q.id]);
  const correct = answered.filter((q) => p.answers[q.id].correct);
  return {
    lessonsDone: ch.lessons.filter((l) => p.lessons[l.id]).length,
    lessonsTotal: ch.lessons.length,
    questionsTotal: qs.length,
    answered: answered.length,
    correct: correct.length,
    /** Share of the chapter's questions answered correctly (most recent attempt). */
    mastery: qs.length ? correct.length / qs.length : 0,
  };
}

export function overallStats(p: Progress) {
  const answered = Object.keys(p.answers).filter((id) => QUESTIONS.some((q) => q.id === id));
  return {
    lessonsDone: LESSONS.filter((l) => p.lessons[l.id]).length,
    lessonsTotal: LESSONS.length,
    answered: answered.length,
    correct: answered.filter((id) => p.answers[id].correct).length,
    questionsTotal: QUESTIONS.length,
    exams: p.exams.length,
  };
}

export const pct = (x: number) => `${Math.round(x * 100)}%`;
