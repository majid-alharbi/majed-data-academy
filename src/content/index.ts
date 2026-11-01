import { ch1 } from './chapters/ch1';
import { ch2 } from './chapters/ch2';
import { ch3 } from './chapters/ch3';
import { ch4 } from './chapters/ch4';
import { ch5 } from './chapters/ch5';
import { review } from './chapters/review';
import { QUESTIONS } from './questions';
import type { Chapter, Lesson } from './types';

export const SOURCE_TITLE = 'ملخص مبسط لإدارة بيانات الأعمال (الفصول 1–5)';

export const CHAPTERS: Chapter[] = [ch1, ch2, ch3, ch4, ch5, review];
export const LESSONS: Lesson[] = CHAPTERS.flatMap((c) => c.lessons);

export const findLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const findChapter = (id: string) => CHAPTERS.find((c) => c.id === id);
export const lessonQuestions = (lessonId: string) => QUESTIONS.filter((q) => q.lessonId === lessonId);

export function neighbours(lessonId: string): { prev?: Lesson; next?: Lesson } {
  const i = LESSONS.findIndex((l) => l.id === lessonId);
  return { prev: LESSONS[i - 1], next: LESSONS[i + 1] };
}

export { QUESTIONS };
