import { describe, expect, it } from 'vitest';
import { ERD_EXAMPLES } from './examples';
import { mapErdToRm, tableToString } from './model';

const mapped = (id: string) => mapErdToRm(ERD_EXAMPLES.find((e) => e.id === id)!.model).map(tableToString);

describe('ERD → relational model mapping', () => {
  it('store example matches the summary (chapter 4 final result)', () => {
    expect(mapped('store')).toEqual([
      'Customers(_CustomerID_, Name, City)',
      'Orders(_OrderID_, Date, CustomerID*)',
      'Products(_ProductID_, Name, Price)',
      'OrderDetails(_OrderID_*, _ProductID_*, Quantity)',
    ]);
  });

  it('company example: composite, derived, multivalued, weak, 1:1, recursive', () => {
    expect(mapped('company')).toEqual([
      'Employee(_EmpID_, FirstName, LastName, BirthDate, BranchID*, Supervisor_EmpID*)',
      'Branch(_BranchID_, BranchName, City, EmpID*, StartDate)',
      'Dependent(_EmpID_*, _DepName_, Relation)',
      'Employee_Phone(_EmpID_*, _Phone_)',
    ]);
  });

  it('university example: M:N with relationship attribute and 1:1 on the total side', () => {
    expect(mapped('university')).toEqual([
      'Student(_StudentID_, SName, GPA, DeptID*)',
      'Course(_CourseID_, Title, Credits)',
      'Department(_DeptID_, DName, FacID*)',
      'Faculty(_FacID_, FName)',
      'Enrollment(_StudentID_*, _CourseID_*, Grade)',
    ]);
  });

  it('ternary relationship becomes a table with three keys', () => {
    expect(mapped('clinic')).toContain('Prescribes(_DoctorID_*, _PatientID_*, _DrugCode_*, RxDate)');
  });
});
