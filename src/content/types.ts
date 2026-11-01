// Content schema. Inline text supports **bold**, `code` and $LaTeX$.

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'code'; code: string }
  | { t: 'math'; tex: string }
  | { t: 'note'; kind: 'simple' | 'remember' | 'warn' | 'extra'; text: string };

export type Activity =
  | { widget: 'flashcards'; title: string; cards: { front: string; back: string }[] }
  | { widget: 'classify'; title: string; buckets: string[]; items: { text: string; bucket: number; why: string }[] }
  | { widget: 'order'; title: string; correct: string[]; why: string }
  | { widget: 'file-vs-db' }
  | { widget: 'levels' }
  | { widget: 'table-anatomy' }
  | { widget: 'keys' }
  | { widget: 'integrity' }
  | { widget: 'ra'; presets: { label: string; expr: string }[] }
  | { widget: 'erd'; example: string }
  | { widget: 'mapping'; example: string }
  | { widget: 'normalization'; preset: { attrs: string; fds: string } }
  | { widget: 'sql'; presets: { label: string; sql: string }[] };

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  goal: string;
  /** Pages of «ملخص مبسط لإدارة بيانات الأعمال» this lesson is based on. */
  sourcePages: number[];
  explain: Block[];
  simpler: Block[];
  brief: { text: string; example: string };
  example: { title: string; blocks: Block[] };
  activity: Activity;
  mistakes: string[];
  review: string[];
}

export interface Chapter {
  id: string;
  number: number | '★';
  title: string;
  description: string;
  topics: string[];
  lessons: Lesson[];
}

interface QuestionBase {
  id: string;
  chapterId: string;
  lessonId: string;
  kind: 'mcq' | 'tf' | 'essay' | 'scenario' | 'fix' | 'math' | 'sql' | 'mapping';
  difficulty: 1 | 2 | 3;
  prompt: string;
  scenario?: string;
  explanation: string;
}

export type Question = QuestionBase &
  (
    | { type: 'choice'; options: string[]; answer: number }
    | { type: 'tf'; answer: boolean }
    | { type: 'essay'; model: string; rubric: string[] }
    | { type: 'ra'; expected: string }
    | { type: 'sql'; expected: string }
  );

export const KIND_LABEL: Record<Question['kind'], string> = {
  mcq: 'اختيار من متعدد',
  tf: 'صح وخطأ',
  essay: 'مقالي',
  scenario: 'سيناريو واقعي',
  fix: 'اكتشف الخطأ',
  math: 'تعبير جبر علائقي',
  sql: 'كتابة SQL',
  mapping: 'رسم وتحويل',
};
