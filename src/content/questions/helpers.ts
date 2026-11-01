import type { Question } from '../types';

type Meta = { kind?: Question['kind']; d?: 1 | 2 | 3; scenario?: string };

const chapterOf = (lessonId: string) => (lessonId.startsWith('l6') ? 'review' : `ch${lessonId[1]}`);

export const mc = (id: string, lessonId: string, prompt: string, options: string[], answer: number, explanation: string, m: Meta = {}): Question => ({
  id, lessonId, chapterId: chapterOf(lessonId), kind: m.kind ?? (m.scenario ? 'scenario' : 'mcq'), difficulty: m.d ?? 1, scenario: m.scenario, prompt, explanation, type: 'choice', options, answer,
});

export const tf = (id: string, lessonId: string, prompt: string, answer: boolean, explanation: string, m: Meta = {}): Question => ({
  id, lessonId, chapterId: chapterOf(lessonId), kind: 'tf', difficulty: m.d ?? 1, scenario: m.scenario, prompt, explanation, type: 'tf', answer,
});

export const essay = (id: string, lessonId: string, prompt: string, model: string, rubric: string[], m: Meta = {}): Question => ({
  id, lessonId, chapterId: chapterOf(lessonId), kind: m.kind ?? (m.scenario ? 'scenario' : 'essay'), difficulty: m.d ?? 2, scenario: m.scenario, prompt, explanation: model, type: 'essay', model, rubric,
});

export const ra = (id: string, lessonId: string, prompt: string, expected: string, explanation: string, m: Meta = {}): Question => ({
  id, lessonId, chapterId: chapterOf(lessonId), kind: 'math', difficulty: m.d ?? 2, scenario: m.scenario, prompt, explanation, type: 'ra', expected,
});

export const sql = (id: string, lessonId: string, prompt: string, expected: string, explanation: string, m: Meta = {}): Question => ({
  id, lessonId, chapterId: chapterOf(lessonId), kind: 'sql', difficulty: m.d ?? 2, scenario: m.scenario, prompt, explanation, type: 'sql', expected,
});
