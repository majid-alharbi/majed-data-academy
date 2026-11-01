import { describe, expect, it } from 'vitest';
import { AlgebraError, columnNames, evaluate, relationsEqual, sampleDatabase } from './index';

const db = sampleDatabase();
const names = (src: string) => evaluate(src, db).relation.rows.map((r) => r[0]);

describe('selection σ', () => {
  it('filters by numeric comparison', () => {
    const r = evaluate('σ[Salary > 8000](Employee)', db).relation;
    expect(r.rows.map((x) => x[1]).sort()).toEqual(['Ahmed', 'Fahad', 'Sara']);
    expect(columnNames(r)).toEqual(['EmpID', 'Name', 'City', 'Salary', 'DeptID']);
  });
  it('supports ∧ ∨ ¬ and strings', () => {
    expect(names("π[Name](σ[City = 'Abha' ∧ Salary ≥ 8000](Employee))").sort()).toEqual(['Ahmed', 'Reem']);
    expect(names("π[Name](σ[City = 'Jeddah' ∨ Salary > 12000](Employee))").sort()).toEqual(['Fahad', 'Noura', 'Omar']);
    expect(names("π[Name](σ[¬(City = 'Abha')](Employee))").length).toBe(4);
  });
  it('treats NULL comparisons as false', () => {
    expect(names('π[Name](σ[DeptID = 10 ∨ DeptID ≠ 10](Employee))')).not.toContain('Omar');
  });
  it('accepts ASCII aliases', () => {
    const a = evaluate("select[Salary >= 9000 and City <> 'Abha'](Employee)", db).relation;
    const b = evaluate("σ[Salary ≥ 9000 ∧ City ≠ 'Abha'](Employee)", db).relation;
    expect(relationsEqual(a, b)).toBe(true);
    expect(a.rows).toHaveLength(2);
  });
  it('is commutative when cascaded', () => {
    const a = evaluate("σ[City = 'Abha'](σ[Salary > 7000](Employee))", db).relation;
    const b = evaluate("σ[Salary > 7000](σ[City = 'Abha'](Employee))", db).relation;
    expect(relationsEqual(a, b)).toBe(true);
  });
});

describe('projection π', () => {
  it('removes duplicate tuples', () => {
    expect(evaluate('π[City](Employee)', db).relation.rows).toHaveLength(3);
    expect(evaluate('π[Location](Department)', db).relation.rows).toHaveLength(3);
  });
  it('rejects unknown attributes with an Arabic message', () => {
    expect(() => evaluate('π[Age](Employee)', db)).toThrow(AlgebraError);
  });
});

describe('set operations', () => {
  it('union / intersect / minus on compatible relations', () => {
    expect(names('π[City](Employee) ∪ π[City](Customer)').sort()).toEqual(['Abha', 'Dammam', 'Jeddah', 'Riyadh']);
    expect(names('π[City](Employee) ∩ π[City](Customer)').sort()).toEqual(['Abha', 'Jeddah', 'Riyadh']);
    expect(names('π[City](Customer) − π[City](Employee)')).toEqual(['Dammam']);
  });
  it('rejects incompatible relations', () => {
    expect(() => evaluate('Employee ∪ Department', db)).toThrow(/توافق/);
  });
  it('employees who never handled an order', () => {
    expect(names('π[EmpID](Employee) − π[EmpID](Orders)').sort()).toEqual([101, 103, 104, 106, 107]);
  });
});

describe('joins', () => {
  it('product has |R|·|S| tuples and qualifies clashing names', () => {
    const r = evaluate('Employee × Department', db).relation;
    expect(r.rows).toHaveLength(7 * 4);
    expect(columnNames(r)).toContain('Employee.DeptID');
  });
  it('natural join matches on common attribute and drops NULL keys', () => {
    const r = evaluate('Employee ⋈ Department', db).relation;
    expect(r.rows).toHaveLength(6);
    expect(columnNames(r)).toEqual(['EmpID', 'Name', 'City', 'Salary', 'DeptID', 'DeptName', 'Location']);
  });
  it('theta join equals selection over product', () => {
    const a = evaluate('Employee ⋈[Employee.DeptID = Department.DeptID] Department', db).relation;
    const b = evaluate('σ[Employee.DeptID = Department.DeptID](Employee × Department)', db).relation;
    expect(relationsEqual(a, b)).toBe(true);
    expect(a.rows).toHaveLength(6);
  });
  it('names of employees working in Abha departments', () => {
    expect(names("π[Name](σ[Location = 'Abha'](Employee ⋈ Department))").sort()).toEqual(['Ahmed', 'Khalid', 'Reem']);
  });
});

describe('rename ρ', () => {
  it('renames relation and attributes', () => {
    const r = evaluate('ρ[E(Id, N)](π[EmpID, Name](Employee))', db).relation;
    expect(columnNames(r)).toEqual(['Id', 'N']);
    expect(r.name).toBe('E');
  });
  it('allows self-join through renaming', () => {
    const r = evaluate(
      'π[A.Name, B.Name](σ[A.City = B.City ∧ A.EmpID < B.EmpID](ρ[A](Employee) × ρ[B](Employee)))',
      db,
    ).relation;
    expect(r.rows).toEqual(
      expect.arrayContaining([
        ['Ahmed', 'Khalid'],
        ['Sara', 'Fahad'],
      ]),
    );
    expect(r.rows).toHaveLength(5);
  });
});

describe('parser errors and LaTeX', () => {
  it('reports unknown relations and incomplete expressions', () => {
    expect(() => evaluate('Staff', db)).toThrow(/غير موجودة/);
    expect(() => evaluate('σ[Salary > ](Employee)', db)).toThrow(AlgebraError);
    expect(() => evaluate('π[Name](Employee', db)).toThrow(AlgebraError);
  });
  it('produces LaTeX with sigma and pi', () => {
    const { latex, steps } = evaluate("π[Name](σ[City = 'Abha'](Employee))", db);
    expect(latex).toContain('\\pi_');
    expect(latex).toContain('\\sigma_');
    expect(steps).toHaveLength(2);
  });
});
