// Parser for a textbook-style relational algebra syntax.
//
//   σ[Salary > 5000 ∧ City = 'Abha'](Employee)
//   π[Name, Salary](Employee)
//   ρ[E](Employee)            ρ[E(Id, N)](π[EmpID, Name](Employee))
//   R ∪ S   R ∩ S   R − S   R × S   R ⋈ S   R ⋈[R.a = S.b] S
//
// ASCII aliases: select/sigma, project/pi, rename/rho, union, intersect,
// minus/except, times/cross, join, and/or/not, <=, >=, <>, !=.

import { AlgebraError, type Value } from './relation';

export type CompareOp = '=' | '≠' | '<' | '≤' | '>' | '≥';

export type Operand = { kind: 'attr'; name: string } | { kind: 'const'; value: Value };

export type Condition =
  | { kind: 'cmp'; op: CompareOp; left: Operand; right: Operand }
  | { kind: 'and'; left: Condition; right: Condition }
  | { kind: 'or'; left: Condition; right: Condition }
  | { kind: 'not'; inner: Condition };

export type Expr =
  | { kind: 'rel'; name: string }
  | { kind: 'select'; cond: Condition; input: Expr }
  | { kind: 'project'; attrs: string[]; input: Expr }
  | { kind: 'rename'; newName: string; attrs?: string[]; input: Expr }
  | { kind: 'union' | 'intersect' | 'minus' | 'product' | 'natjoin'; left: Expr; right: Expr }
  | { kind: 'thetajoin'; cond: Condition; left: Expr; right: Expr };

type TokType = 'ident' | 'num' | 'str' | 'sym' | 'eof';
interface Token {
  type: TokType;
  value: string;
  pos: number;
}

const KEYWORDS: Record<string, string> = {
  select: 'σ', sigma: 'σ', project: 'π', pi: 'π', rename: 'ρ', rho: 'ρ',
  union: '∪', intersect: '∩', minus: '−', except: '−', times: '×', cross: '×', join: '⋈',
  and: '∧', or: '∨', not: '¬',
};

const SYMBOLS: [string, string][] = [
  ['<=', '≤'], ['>=', '≥'], ['<>', '≠'], ['!=', '≠'],
  ['σ', 'σ'], ['π', 'π'], ['ρ', 'ρ'], ['∪', '∪'], ['∩', '∩'], ['−', '−'], ['-', '−'], ['×', '×'], ['⋈', '⋈'], ['⨝', '⋈'],
  ['∧', '∧'], ['∨', '∨'], ['¬', '¬'], ['=', '='], ['≠', '≠'], ['<', '<'], ['>', '>'], ['≤', '≤'], ['≥', '≥'],
  ['(', '('], [')', ')'], ['[', '['], [']', ']'], [',', ','], ['،', ','],
];

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '‘' || ch === '’') {
      let j = i + 1;
      while (j < src.length && !["'", '’', '‘'].includes(src[j])) j++;
      if (j >= src.length) throw new AlgebraError('نص لم يُغلق بعلامة اقتباس مفردة', i);
      tokens.push({ type: 'str', value: src.slice(i + 1, j), pos: i });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i))!;
      tokens.push({ type: 'num', value: m[0], pos: i });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?/.exec(src.slice(i))!;
      const kw = KEYWORDS[m[0].toLowerCase()];
      tokens.push(kw ? { type: 'sym', value: kw, pos: i } : { type: 'ident', value: m[0], pos: i });
      i += m[0].length;
      continue;
    }
    const sym = SYMBOLS.find(([s]) => src.startsWith(s, i));
    if (!sym) throw new AlgebraError(`رمز غير معروف «${ch}»`, i);
    tokens.push({ type: 'sym', value: sym[1], pos: i });
    i += sym[0].length;
  }
  tokens.push({ type: 'eof', value: '', pos: src.length });
  return tokens;
}

class Parser {
  private i = 0;
  constructor(private tokens: Token[]) {}

  private peek() {
    return this.tokens[this.i];
  }
  private next() {
    return this.tokens[this.i++];
  }
  private isSym(v: string) {
    const t = this.peek();
    return t.type === 'sym' && t.value === v;
  }
  private expect(v: string, what = v) {
    const t = this.next();
    if (t.type !== 'sym' || t.value !== v) {
      throw new AlgebraError(`متوقع «${what}» ${t.type === 'eof' ? 'قبل نهاية التعبير' : `ولكن وُجد «${t.value}»`}`, t.pos);
    }
  }
  private ident(what: string) {
    const t = this.next();
    if (t.type !== 'ident') throw new AlgebraError(`متوقع ${what}`, t.pos);
    return t.value;
  }

  parse(): Expr {
    const e = this.setExpr();
    const t = this.peek();
    if (t.type !== 'eof') throw new AlgebraError(`جزء زائد غير مفهوم بدءًا من «${t.value}»`, t.pos);
    return e;
  }

  // Set operators bind looser than products and joins.
  private setExpr(): Expr {
    let left = this.joinExpr();
    for (;;) {
      const t = this.peek();
      const kind = t.value === '∪' ? 'union' : t.value === '∩' ? 'intersect' : t.value === '−' ? 'minus' : null;
      if (t.type !== 'sym' || !kind) return left;
      this.next();
      left = { kind, left, right: this.joinExpr() };
    }
  }

  private joinExpr(): Expr {
    let left = this.unary();
    for (;;) {
      if (this.isSym('×')) {
        this.next();
        left = { kind: 'product', left, right: this.unary() };
      } else if (this.isSym('⋈')) {
        this.next();
        if (this.isSym('[')) {
          this.next();
          const cond = this.condition();
          this.expect(']');
          left = { kind: 'thetajoin', cond, left, right: this.unary() };
        } else {
          left = { kind: 'natjoin', left, right: this.unary() };
        }
      } else return left;
    }
  }

  private unary(): Expr {
    const t = this.peek();
    if (t.type === 'sym' && t.value === 'σ') {
      this.next();
      this.expect('[', '[ بعد σ لكتابة شرط الاختيار');
      const cond = this.condition();
      this.expect(']');
      return { kind: 'select', cond, input: this.unary() };
    }
    if (t.type === 'sym' && t.value === 'π') {
      this.next();
      this.expect('[', '[ بعد π لكتابة الصفات');
      const attrs = this.attrList();
      this.expect(']');
      return { kind: 'project', attrs, input: this.unary() };
    }
    if (t.type === 'sym' && t.value === 'ρ') {
      this.next();
      this.expect('[', '[ بعد ρ');
      const newName = this.ident('اسمًا جديدًا للعلاقة');
      let attrs: string[] | undefined;
      if (this.isSym('(')) {
        this.next();
        attrs = this.attrList();
        this.expect(')');
      }
      this.expect(']');
      return { kind: 'rename', newName, attrs, input: this.unary() };
    }
    if (t.type === 'sym' && t.value === '(') {
      this.next();
      const e = this.setExpr();
      this.expect(')');
      return e;
    }
    if (t.type === 'ident') {
      this.next();
      return { kind: 'rel', name: t.value };
    }
    throw new AlgebraError(t.type === 'eof' ? 'التعبير ناقص' : `متوقع اسم علاقة أو عملية ولكن وُجد «${t.value}»`, t.pos);
  }

  private attrList(): string[] {
    const list = [this.ident('اسم صفة')];
    while (this.isSym(',')) {
      this.next();
      list.push(this.ident('اسم صفة بعد الفاصلة'));
    }
    return list;
  }

  private condition(): Condition {
    let left = this.andCond();
    while (this.isSym('∨')) {
      this.next();
      left = { kind: 'or', left, right: this.andCond() };
    }
    return left;
  }
  private andCond(): Condition {
    let left = this.notCond();
    while (this.isSym('∧')) {
      this.next();
      left = { kind: 'and', left, right: this.notCond() };
    }
    return left;
  }
  private notCond(): Condition {
    if (this.isSym('¬')) {
      this.next();
      return { kind: 'not', inner: this.notCond() };
    }
    if (this.isSym('(')) {
      this.next();
      const c = this.condition();
      this.expect(')');
      return c;
    }
    const left = this.operand();
    const t = this.next();
    if (t.type !== 'sym' || !['=', '≠', '<', '≤', '>', '≥'].includes(t.value)) {
      throw new AlgebraError('متوقع عامل مقارنة مثل = أو > أو ≠', t.pos);
    }
    return { kind: 'cmp', op: t.value as CompareOp, left, right: this.operand() };
  }
  private operand(): Operand {
    const t = this.next();
    if (t.type === 'ident') return { kind: 'attr', name: t.value };
    if (t.type === 'num') return { kind: 'const', value: Number(t.value) };
    if (t.type === 'str') return { kind: 'const', value: t.value };
    if (t.type === 'sym' && t.value === '−' && this.peek().type === 'num') {
      return { kind: 'const', value: -Number(this.next().value) };
    }
    throw new AlgebraError('متوقع اسم صفة أو قيمة (رقم أو نص بين علامتي اقتباس)', t.pos);
  }
}

export function parseAlgebra(src: string): Expr {
  if (!src.trim()) throw new AlgebraError('اكتب تعبيرًا أولًا');
  return new Parser(tokenize(src)).parse();
}
