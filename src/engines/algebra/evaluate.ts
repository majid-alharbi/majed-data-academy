import type { Condition, Expr, Operand } from './parser';
import { parseAlgebra } from './parser';
import {
  AlgebraError,
  columnNames,
  compareValues,
  dedupe,
  resolveAttribute,
  type Attribute,
  type Relation,
  type Value,
} from './relation';

export type Database = Record<string, Relation>;

export interface Step {
  /** LaTeX for the sub-expression that produced this result. */
  latex: string;
  relation: Relation;
}

export interface EvalResult {
  relation: Relation;
  latex: string;
  steps: Step[];
}

function lookup(db: Database, name: string): Relation {
  const key = Object.keys(db).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) throw new AlgebraError(`العلاقة «${name}» غير موجودة. العلاقات المتاحة: ${Object.keys(db).join('، ')}`);
  return db[key];
}

function operandValue(rel: Relation, row: Value[], o: Operand): Value {
  return o.kind === 'const' ? o.value : row[resolveAttribute(rel, o.name)];
}

function test(rel: Relation, row: Value[], c: Condition): boolean {
  switch (c.kind) {
    case 'and':
      return test(rel, row, c.left) && test(rel, row, c.right);
    case 'or':
      return test(rel, row, c.left) || test(rel, row, c.right);
    case 'not':
      return !test(rel, row, c.inner);
    case 'cmp': {
      const cmp = compareValues(operandValue(rel, row, c.left), operandValue(rel, row, c.right));
      if (cmp === null) return false; // comparisons with NULL are never true
      switch (c.op) {
        case '=': return cmp === 0;
        case '≠': return cmp !== 0;
        case '<': return cmp < 0;
        case '≤': return cmp <= 0;
        case '>': return cmp > 0;
        case '≥': return cmp >= 0;
      }
    }
  }
}

/** Validate that all attributes in a condition exist before scanning rows (so empty relations still report errors). */
function checkCondition(rel: Relation, c: Condition): void {
  if (c.kind === 'cmp') {
    for (const o of [c.left, c.right]) if (o.kind === 'attr') resolveAttribute(rel, o.name);
  } else if (c.kind === 'not') checkCondition(rel, c.inner);
  else {
    checkCondition(rel, c.left);
    checkCondition(rel, c.right);
  }
}

export function select(rel: Relation, cond: Condition): Relation {
  checkCondition(rel, cond);
  return { attributes: rel.attributes, rows: rel.rows.filter((r) => test(rel, r, cond)) };
}

export function project(rel: Relation, attrs: string[]): Relation {
  const idx = attrs.map((a) => resolveAttribute(rel, a));
  if (new Set(idx).size !== idx.length) throw new AlgebraError('لا يجوز تكرار الصفة نفسها في قائمة الإسقاط');
  return { attributes: idx.map((i) => rel.attributes[i]), rows: dedupe(rel.rows.map((r) => idx.map((i) => r[i]))) };
}

export function rename(rel: Relation, newName: string, attrs?: string[]): Relation {
  if (attrs && attrs.length !== rel.attributes.length) {
    throw new AlgebraError(`عدد الأسماء الجديدة (${attrs.length}) لا يساوي عدد صفات العلاقة (${rel.attributes.length})`);
  }
  return {
    name: newName,
    attributes: rel.attributes.map((a, i) => ({ name: attrs ? attrs[i] : a.name, source: newName })),
    rows: rel.rows,
  };
}

function requireCompatible(a: Relation, b: Relation, op: string) {
  if (a.attributes.length !== b.attributes.length) {
    throw new AlgebraError(
      `عملية ${op} تتطلب توافق الاتحاد: العلاقة الأولى فيها ${a.attributes.length} صفات والثانية ${b.attributes.length}`,
    );
  }
}

const keyOf = (r: Value[]) => JSON.stringify(r);

export function union(a: Relation, b: Relation): Relation {
  requireCompatible(a, b, 'الاتحاد ∪');
  return { attributes: a.attributes, rows: dedupe([...a.rows, ...b.rows]) };
}
export function intersect(a: Relation, b: Relation): Relation {
  requireCompatible(a, b, 'التقاطع ∩');
  const bk = new Set(b.rows.map(keyOf));
  return { attributes: a.attributes, rows: a.rows.filter((r) => bk.has(keyOf(r))) };
}
export function minus(a: Relation, b: Relation): Relation {
  requireCompatible(a, b, 'الفرق −');
  const bk = new Set(b.rows.map(keyOf));
  return { attributes: a.attributes, rows: a.rows.filter((r) => !bk.has(keyOf(r))) };
}

export function product(a: Relation, b: Relation): Relation {
  const attributes: Attribute[] = [...a.attributes, ...b.attributes];
  const rows: Value[][] = [];
  for (const x of a.rows) for (const y of b.rows) rows.push([...x, ...y]);
  return { attributes, rows };
}

export function thetaJoin(a: Relation, b: Relation, cond: Condition): Relation {
  return select(product(a, b), cond);
}

export function naturalJoin(a: Relation, b: Relation): Relation {
  const common: [number, number][] = [];
  b.attributes.forEach((bt, j) => {
    const i = a.attributes.findIndex((at) => at.name.toLowerCase() === bt.name.toLowerCase());
    if (i >= 0) common.push([i, j]);
  });
  const rightKeep = b.attributes.map((_, j) => j).filter((j) => !common.some(([, cj]) => cj === j));
  const rows: Value[][] = [];
  for (const x of a.rows) {
    for (const y of b.rows) {
      if (common.every(([i, j]) => compareValues(x[i], y[j]) === 0)) rows.push([...x, ...rightKeep.map((j) => y[j])]);
    }
  }
  return { attributes: [...a.attributes, ...rightKeep.map((j) => b.attributes[j])], rows: dedupe(rows) };
}

// ---------- LaTeX rendering ----------

const tex = (s: string) => `\\text{${s.replace(/\\/g, '').replace(/([_%&#{}$])/g, '\\$1')}}`;
const OP_TEX = { '=': '=', '≠': '\\neq', '<': '<', '≤': '\\leq', '>': '>', '≥': '\\geq' } as const;

function operandTex(o: Operand): string {
  if (o.kind === 'attr') return tex(o.name);
  return typeof o.value === 'number' ? String(o.value) : tex(`'${o.value}'`);
}

export function conditionToLatex(c: Condition): string {
  switch (c.kind) {
    case 'cmp':
      return `${operandTex(c.left)} ${OP_TEX[c.op]} ${operandTex(c.right)}`;
    case 'and':
      return `${wrapCond(c.left, 'and')} \\land ${wrapCond(c.right, 'and')}`;
    case 'or':
      return `${wrapCond(c.left, 'or')} \\lor ${wrapCond(c.right, 'or')}`;
    case 'not':
      return `\\lnot ${c.inner.kind === 'cmp' ? `(${conditionToLatex(c.inner)})` : wrapCond(c.inner, 'not')}`;
  }
}
function wrapCond(c: Condition, parent: 'and' | 'or' | 'not'): string {
  const s = conditionToLatex(c);
  return (parent === 'and' && c.kind === 'or') || (parent === 'not' && c.kind !== 'cmp') ? `(${s})` : s;
}

const BIN_TEX = { union: '\\cup', intersect: '\\cap', minus: '-', product: '\\times', natjoin: '\\bowtie' } as const;

export function toLatex(e: Expr): string {
  switch (e.kind) {
    case 'rel':
      return tex(e.name);
    case 'select':
      return `\\sigma_{${conditionToLatex(e.cond)}}(${toLatex(e.input)})`;
    case 'project':
      return `\\pi_{${e.attrs.map(tex).join(',\\,')}}(${toLatex(e.input)})`;
    case 'rename':
      return `\\rho_{${tex(e.newName)}${e.attrs ? `(${e.attrs.map(tex).join(',')})` : ''}}(${toLatex(e.input)})`;
    case 'thetajoin':
      return `${side(e.left)} \\bowtie_{${conditionToLatex(e.cond)}} ${side(e.right)}`;
    default:
      return `${side(e.left)} ${BIN_TEX[e.kind]} ${side(e.right)}`;
  }
}
function side(e: Expr): string {
  const s = toLatex(e);
  return ['union', 'intersect', 'minus', 'product', 'natjoin', 'thetajoin'].includes(e.kind) ? `(${s})` : s;
}

// ---------- Evaluation with step trace ----------

function run(e: Expr, db: Database, steps: Step[]): Relation {
  let rel: Relation;
  switch (e.kind) {
    case 'rel': {
      const base = lookup(db, e.name);
      return base; // base relations are not recorded as steps
    }
    case 'select':
      rel = select(run(e.input, db, steps), e.cond);
      break;
    case 'project':
      rel = project(run(e.input, db, steps), e.attrs);
      break;
    case 'rename':
      rel = rename(run(e.input, db, steps), e.newName, e.attrs);
      break;
    case 'union':
      rel = union(run(e.left, db, steps), run(e.right, db, steps));
      break;
    case 'intersect':
      rel = intersect(run(e.left, db, steps), run(e.right, db, steps));
      break;
    case 'minus':
      rel = minus(run(e.left, db, steps), run(e.right, db, steps));
      break;
    case 'product':
      rel = product(run(e.left, db, steps), run(e.right, db, steps));
      break;
    case 'natjoin':
      rel = naturalJoin(run(e.left, db, steps), run(e.right, db, steps));
      break;
    case 'thetajoin':
      rel = thetaJoin(run(e.left, db, steps), run(e.right, db, steps), e.cond);
      break;
  }
  steps.push({ latex: toLatex(e), relation: rel });
  return rel;
}

export function evaluateExpr(e: Expr, db: Database): EvalResult {
  const steps: Step[] = [];
  const relation = run(e, db, steps);
  return { relation, latex: toLatex(e), steps };
}

export function evaluate(src: string, db: Database): EvalResult {
  return evaluateExpr(parseAlgebra(src), db);
}

export { columnNames };
