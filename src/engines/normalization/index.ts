// Functional-dependency toolkit: attribute closure, candidate keys, normal-form check,
// minimal cover and 3NF synthesis. Attributes are plain names; FDs are written "A, B -> C".

export interface FD {
  lhs: string[];
  rhs: string[];
}

export type NormalForm = '1NF' | '2NF' | '3NF' | 'BCNF';

export interface Violation {
  form: '2NF' | '3NF' | 'BCNF';
  fd: FD;
  reason: string;
}

export class FDError extends Error {}

const uniq = (xs: string[]) => [...new Set(xs)];
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
const subset = (a: string[], b: string[]) => a.every((x) => b.includes(x));

export function fdToString(fd: FD): string {
  return `${fd.lhs.join(', ')} → ${fd.rhs.join(', ')}`;
}

export function parseAttributes(src: string): string[] {
  const list = src.split(/[,،\s]+/).map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) throw new FDError('اكتب صفات العلاقة مفصولة بفواصل');
  return uniq(list);
}

export function parseFDs(src: string, attributes: string[]): FD[] {
  const fds: FD[] = [];
  const lines = src.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/->|→|=>/);
    if (parts.length !== 2) throw new FDError(`الاعتماد «${line}» يجب أن يكون بالصيغة A, B -> C`);
    const lhs = parseAttributes(parts[0]);
    const rhs = parseAttributes(parts[1]);
    for (const a of [...lhs, ...rhs]) {
      if (!attributes.includes(a)) throw new FDError(`الصفة «${a}» في «${line}» ليست من صفات العلاقة`);
    }
    fds.push({ lhs, rhs });
  }
  return fds;
}

export function closure(attrs: string[], fds: FD[]): string[] {
  const result = new Set(attrs);
  let changed = true;
  while (changed) {
    changed = false;
    for (const fd of fds) {
      if (fd.lhs.every((a) => result.has(a)) && fd.rhs.some((a) => !result.has(a))) {
        fd.rhs.forEach((a) => result.add(a));
        changed = true;
      }
    }
  }
  return [...result];
}

export function isSuperkey(attrs: string[], all: string[], fds: FD[]): boolean {
  return subset(all, closure(attrs, fds));
}

/** All candidate keys, smallest first. Exponential in the worst case, so the input is capped. */
export function candidateKeys(all: string[], fds: FD[]): string[][] {
  if (all.length > 14) throw new FDError('الحد الأقصى 14 صفة في هذا المختبر');
  // Attributes never on a right-hand side must be in every key.
  const onRight = new Set(fds.flatMap((f) => f.rhs.filter((a) => !f.lhs.includes(a))));
  const core = all.filter((a) => !onRight.has(a));
  const rest = all.filter((a) => onRight.has(a));
  const keys: string[][] = [];
  for (let size = 0; size <= rest.length; size++) {
    for (const combo of combinations(rest, size)) {
      const cand = [...core, ...combo];
      if (keys.some((k) => subset(k, cand))) continue;
      if (isSuperkey(cand, all, fds)) keys.push(cand);
    }
  }
  return keys.map((k) => all.filter((a) => k.includes(a)));
}

function* combinations(xs: string[], k: number, start = 0, acc: string[] = []): Generator<string[]> {
  if (acc.length === k) {
    yield acc;
    return;
  }
  for (let i = start; i < xs.length; i++) yield* combinations(xs, k, i + 1, [...acc, xs[i]]);
}

/** Split right-hand sides and drop trivial dependencies. */
export function splitFDs(fds: FD[]): FD[] {
  const out: FD[] = [];
  for (const f of fds) {
    for (const a of f.rhs) {
      if (f.lhs.includes(a)) continue;
      if (!out.some((g) => sameSet(g.lhs, f.lhs) && g.rhs[0] === a)) out.push({ lhs: f.lhs, rhs: [a] });
    }
  }
  return out;
}

export interface Analysis {
  keys: string[][];
  prime: string[];
  normalForm: NormalForm;
  violations: Violation[];
}

/**
 * Highest normal form of a relation (1NF assumed: atomic values).
 * Testing the given FDs (with split right-hand sides) is sufficient for 3NF and BCNF on the full relation;
 * 2NF is tested exactly by checking every proper subset of every candidate key.
 */
export function analyze(all: string[], fds: FD[]): Analysis {
  const keys = candidateKeys(all, fds);
  const prime = all.filter((a) => keys.some((k) => k.includes(a)));
  const nonPrime = all.filter((a) => !prime.includes(a));
  const violations: Violation[] = [];

  for (const key of keys) {
    if (key.length < 2) continue;
    for (let size = 1; size < key.length; size++) {
      for (const part of combinations(key, size)) {
        const dependents = closure(part, fds).filter((a) => nonPrime.includes(a));
        if (dependents.length && !violations.some((v) => v.form === '2NF' && sameSet(v.fd.lhs, part))) {
          violations.push({
            form: '2NF',
            fd: { lhs: part, rhs: dependents },
            reason: `اعتماد جزئي: ${dependents.join('، ')} تعتمد على جزء من المفتاح (${key.join(', ')})`,
          });
        }
      }
    }
  }

  for (const fd of splitFDs(fds)) {
    if (isSuperkey(fd.lhs, all, fds)) continue;
    const a = fd.rhs[0];
    violations.push({
      form: 'BCNF',
      fd,
      reason: `المحدِّد (${fd.lhs.join(', ')}) ليس مفتاحًا مرشحًا ولا مفتاحًا فائقًا`,
    });
    if (!prime.includes(a)) {
      violations.push({
        form: '3NF',
        fd,
        reason: `${a} صفة غير أولية تعتمد على (${fd.lhs.join(', ')}) الذي ليس مفتاحًا فائقًا`,
      });
    }
  }

  const has = (f: Violation['form']) => violations.some((v) => v.form === f);
  const normalForm: NormalForm = has('2NF') ? '1NF' : has('3NF') ? '2NF' : has('BCNF') ? '3NF' : 'BCNF';
  return { keys, prime, normalForm, violations };
}

export function minimalCover(fds: FD[]): FD[] {
  let g = splitFDs(fds);
  // Remove extraneous left-hand-side attributes.
  g = g.map((f) => {
    let lhs = [...f.lhs];
    for (const b of f.lhs) {
      if (lhs.length < 2) break;
      const reduced = lhs.filter((x) => x !== b);
      if (closure(reduced, g).includes(f.rhs[0])) lhs = reduced;
    }
    return { lhs, rhs: f.rhs };
  });
  g = g.filter((f, i) => g.findIndex((h) => sameSet(h.lhs, f.lhs) && h.rhs[0] === f.rhs[0]) === i);
  // Remove redundant dependencies.
  for (let i = 0; i < g.length; ) {
    const others = g.filter((_, j) => j !== i);
    if (closure(g[i].lhs, others).includes(g[i].rhs[0])) g = others;
    else i++;
  }
  return g;
}

export interface DecomposedRelation {
  attributes: string[];
  key: string[];
}

/** Lossless, dependency-preserving 3NF synthesis (Bernstein). */
export function synthesize3NF(all: string[], fds: FD[]): DecomposedRelation[] {
  const cover = minimalCover(fds);
  const groups: { lhs: string[]; rhs: string[] }[] = [];
  for (const f of cover) {
    const g = groups.find((x) => sameSet(x.lhs, f.lhs));
    if (g) g.rhs.push(f.rhs[0]);
    else groups.push({ lhs: f.lhs, rhs: [...f.rhs] });
  }
  let rels: DecomposedRelation[] = groups.map((g) => ({ attributes: all.filter((a) => g.lhs.includes(a) || g.rhs.includes(a)), key: g.lhs }));
  const keys = candidateKeys(all, fds);
  if (!rels.some((r) => keys.some((k) => subset(k, r.attributes)))) {
    rels.push({ attributes: keys[0], key: keys[0] });
  }
  rels = rels.filter((r, i) => !rels.some((s, j) => j !== i && subset(r.attributes, s.attributes) && (r.attributes.length < s.attributes.length || j < i)));
  return rels;
}
