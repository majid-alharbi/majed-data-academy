// Core relational model used by the relational-algebra engine.
// Relations follow set semantics: duplicate tuples are always removed.

export type Value = string | number | null;

export interface Attribute {
  name: string;
  /** Relation the attribute came from; used to qualify names like Employee.Name. */
  source?: string;
}

export interface Relation {
  name?: string;
  attributes: Attribute[];
  rows: Value[][];
}

export class AlgebraError extends Error {
  constructor(message: string, public position?: number) {
    super(message);
    this.name = 'AlgebraError';
  }
}

export function makeRelation(name: string, columns: string[], rows: Value[][]): Relation {
  return { name, attributes: columns.map((c) => ({ name: c, source: name })), rows: dedupe(rows) };
}

const rowKey = (row: Value[]) => JSON.stringify(row);

export function dedupe(rows: Value[][]): Value[][] {
  const seen = new Set<string>();
  const out: Value[][] = [];
  for (const r of rows) {
    const k = rowKey(r);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(r);
    }
  }
  return out;
}

/** Display name of an attribute, qualified only when the plain name is ambiguous in the relation. */
export function displayName(rel: Relation, index: number): string {
  const a = rel.attributes[index];
  const clashes = rel.attributes.filter((b) => b.name === a.name).length > 1;
  return clashes && a.source ? `${a.source}.${a.name}` : a.name;
}

export function columnNames(rel: Relation): string[] {
  return rel.attributes.map((_, i) => displayName(rel, i));
}

/** Resolve "Name" or "Employee.Name" to a column index. */
export function resolveAttribute(rel: Relation, ref: string): number {
  const dot = ref.lastIndexOf('.');
  const lower = (s: string) => s.toLowerCase();
  let matches: number[];
  if (dot > 0) {
    const src = ref.slice(0, dot);
    const name = ref.slice(dot + 1);
    matches = rel.attributes
      .map((a, i) => (lower(a.name) === lower(name) && lower(a.source ?? '') === lower(src) ? i : -1))
      .filter((i) => i >= 0);
  } else {
    matches = rel.attributes.map((a, i) => (lower(a.name) === lower(ref) ? i : -1)).filter((i) => i >= 0);
  }
  if (matches.length === 0) {
    throw new AlgebraError(`الصفة «${ref}» غير موجودة. الصفات المتاحة: ${columnNames(rel).join('، ')}`);
  }
  if (matches.length > 1) {
    throw new AlgebraError(`الصفة «${ref}» غامضة لأنها موجودة في أكثر من علاقة؛ اكتبها بالصيغة Relation.${ref}`);
  }
  return matches[0];
}

export function compareValues(a: Value, b: Value): number | null {
  if (a === null || b === null) return null;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

/** Two relations are equal when they have the same attribute names (any order) and the same set of tuples. */
export function relationsEqual(a: Relation, b: Relation): boolean {
  const an = columnNames(a).map((n) => n.toLowerCase());
  const bn = columnNames(b).map((n) => n.toLowerCase());
  if (an.length !== bn.length) return false;
  const order = an.map((n) => bn.indexOf(n));
  if (order.some((i) => i < 0)) return false;
  if (a.rows.length !== b.rows.length) return false;
  const bKeys = new Set(b.rows.map(rowKey));
  return a.rows.every((r) => bKeys.has(rowKey(order.map((_, j) => r[an.indexOf(bn[j])]))));
}
