// Student progress lives only in this browser (localStorage). Nothing is sent anywhere.
import { useSyncExternalStore } from 'react';

export interface AnswerRecord {
  correct: boolean;
  /** For self-assessed essays: fraction of rubric items met (0–1). */
  score?: number;
  attempts: number;
  at: number;
}

export interface ExamRecord {
  at: number;
  chapters: string[];
  total: number;
  score: number;
  max: number;
  durationSec: number;
}

export interface Progress {
  version: 1;
  lessons: Record<string, { completedAt: number }>;
  answers: Record<string, AnswerRecord>;
  exams: ExamRecord[];
  labs: Record<string, number>;
}

const KEY = 'majed-data-academy:progress:v1';
const empty = (): Progress => ({ version: 1, lessons: {}, answers: {}, exams: [], labs: {} });

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const p = JSON.parse(raw) as Progress;
    return p.version === 1 ? { ...empty(), ...p } : empty();
  } catch {
    return empty();
  }
}

let state = load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode); progress then lasts for this session only.
  }
  listeners.forEach((l) => l());
}

export const progressStore = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  completeLesson(id: string) {
    commit({ ...state, lessons: { ...state.lessons, [id]: { completedAt: Date.now() } } });
  },
  uncompleteLesson(id: string) {
    const lessons = { ...state.lessons };
    delete lessons[id];
    commit({ ...state, lessons });
  },
  recordAnswer(id: string, correct: boolean, score?: number) {
    const prev = state.answers[id];
    commit({ ...state, answers: { ...state.answers, [id]: { correct, score, attempts: (prev?.attempts ?? 0) + 1, at: Date.now() } } });
  },
  recordExam(e: ExamRecord) {
    commit({ ...state, exams: [...state.exams, e].slice(-50) });
  },
  recordLab(lab: string) {
    commit({ ...state, labs: { ...state.labs, [lab]: (state.labs[lab] ?? 0) + 1 } });
  },
  reset() {
    commit(empty());
  },
  export(): string {
    return JSON.stringify(state, null, 2);
  },
};

export function useProgress(): Progress {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.get);
}
