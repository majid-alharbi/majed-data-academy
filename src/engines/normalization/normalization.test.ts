import { describe, expect, it } from 'vitest';
import { analyze, candidateKeys, closure, minimalCover, parseFDs, synthesize3NF } from './index';

const R = (attrs: string, fds: string) => {
  const all = attrs.split(',').map((s) => s.trim());
  return { all, fds: parseFDs(fds, all) };
};

describe('closure and keys', () => {
  it('computes attribute closure', () => {
    const { fds } = R('A,B,C,D,E', 'A -> B\nB -> C\nC,D -> E');
    expect(closure(['A'], fds).sort()).toEqual(['A', 'B', 'C']);
    expect(closure(['A', 'D'], fds).sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
  it('finds multiple candidate keys', () => {
    const { all, fds } = R('A,B,C', 'A -> B\nB -> A\nA -> C');
    expect(candidateKeys(all, fds)).toEqual([['A'], ['B']]);
  });
});

describe('normal forms', () => {
  it('detects partial dependency → 1NF', () => {
    // OrderItem with product name depending only on ProdID
    const { all, fds } = R('OrderID,ProdID,Qty,PName', 'OrderID, ProdID -> Qty\nProdID -> PName');
    const a = analyze(all, fds);
    expect(a.keys).toEqual([['OrderID', 'ProdID']]);
    expect(a.normalForm).toBe('1NF');
  });
  it('detects transitive dependency → 2NF', () => {
    const { all, fds } = R('EmpID,Name,DeptID,DeptName', 'EmpID -> Name, DeptID\nDeptID -> DeptName');
    expect(analyze(all, fds).normalForm).toBe('2NF');
  });
  it('3NF but not BCNF (classic Student-Course-Instructor)', () => {
    const { all, fds } = R('Student,Course,Instructor', 'Student, Course -> Instructor\nInstructor -> Course');
    const a = analyze(all, fds);
    expect(a.keys).toHaveLength(2);
    expect(a.normalForm).toBe('3NF');
  });
  it('BCNF when every determinant is a superkey', () => {
    const { all, fds } = R('CustID,CName,City', 'CustID -> CName, City');
    expect(analyze(all, fds).normalForm).toBe('BCNF');
  });
});

describe('minimal cover and synthesis', () => {
  it('removes extraneous attributes and redundant FDs', () => {
    const { fds } = R('A,B,C', 'A -> B, C\nB -> C\nA, B -> C');
    const cover = minimalCover(fds).map((f) => `${f.lhs.join('')}>${f.rhs.join('')}`).sort();
    expect(cover).toEqual(['A>B', 'B>C']);
  });
  it('synthesizes 3NF relations that include a key', () => {
    const { all, fds } = R('EmpID,Name,DeptID,DeptName,ProjID,Hours', 'EmpID -> Name, DeptID\nDeptID -> DeptName\nEmpID, ProjID -> Hours');
    const rels = synthesize3NF(all, fds);
    expect(rels.map((r) => r.attributes.join(','))).toEqual(['EmpID,Name,DeptID', 'DeptID,DeptName', 'EmpID,ProjID,Hours']);
    for (const r of rels) expect(analyze(r.attributes, fds.filter((f) => [...f.lhs, ...f.rhs].every((x) => r.attributes.includes(x))).map((f) => ({ lhs: f.lhs, rhs: f.rhs.filter((x) => r.attributes.includes(x)) }))).normalForm).not.toBe('1NF');
  });
  it('rejects unknown attributes', () => {
    expect(() => parseFDs('X -> A', ['A', 'B'])).toThrow();
  });
});
