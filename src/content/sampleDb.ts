// One sample business database shared by the relational-algebra lab, the SQL lab and auto-graded questions.
// Keep it small enough to read on a phone screen, but rich enough for joins, NULLs and set operations.

import type { Value } from '../engines/algebra/relation';

export interface TableDef {
  name: string;
  description: string;
  columns: { name: string; sqlType: string; pk?: boolean; fk?: string }[];
  rows: Value[][];
}

export const SAMPLE_TABLES: TableDef[] = [
  {
    name: 'Department',
    description: 'الأقسام',
    columns: [
      { name: 'DeptID', sqlType: 'NUMBER(3)', pk: true },
      { name: 'DeptName', sqlType: 'VARCHAR2(30)' },
      { name: 'Location', sqlType: 'VARCHAR2(20)' },
    ],
    rows: [
      [10, 'Sales', 'Riyadh'],
      [20, 'IT', 'Abha'],
      [30, 'HR', 'Jeddah'],
      [40, 'Finance', 'Abha'],
    ],
  },
  {
    name: 'Employee',
    description: 'الموظفون',
    columns: [
      { name: 'EmpID', sqlType: 'NUMBER(4)', pk: true },
      { name: 'Name', sqlType: 'VARCHAR2(30)' },
      { name: 'City', sqlType: 'VARCHAR2(20)' },
      { name: 'Salary', sqlType: 'NUMBER(8,2)' },
      { name: 'DeptID', sqlType: 'NUMBER(3)', fk: 'Department(DeptID)' },
    ],
    rows: [
      [101, 'Ahmed', 'Abha', 9000, 20],
      [102, 'Sara', 'Riyadh', 12000, 10],
      [103, 'Khalid', 'Abha', 6500, 20],
      [104, 'Noura', 'Jeddah', 7000, 30],
      [105, 'Fahad', 'Riyadh', 15000, 10],
      [106, 'Reem', 'Abha', 8000, 40],
      [107, 'Omar', 'Jeddah', 5000, null],
    ],
  },
  {
    name: 'Customer',
    description: 'العملاء',
    columns: [
      { name: 'CustID', sqlType: 'NUMBER(4)', pk: true },
      { name: 'CName', sqlType: 'VARCHAR2(30)' },
      { name: 'City', sqlType: 'VARCHAR2(20)' },
      { name: 'Segment', sqlType: 'VARCHAR2(10)' },
    ],
    rows: [
      [1, 'Al-Noor Co', 'Abha', 'Corporate'],
      [2, 'Hessa', 'Riyadh', 'Retail'],
      [3, 'Bina Ltd', 'Jeddah', 'Corporate'],
      [4, 'Majed', 'Abha', 'Retail'],
      [5, 'Sahm Co', 'Dammam', 'Corporate'],
    ],
  },
  {
    name: 'Product',
    description: 'المنتجات',
    columns: [
      { name: 'ProdID', sqlType: 'NUMBER(4)', pk: true },
      { name: 'PName', sqlType: 'VARCHAR2(30)' },
      { name: 'Category', sqlType: 'VARCHAR2(20)' },
      { name: 'Price', sqlType: 'NUMBER(8,2)' },
    ],
    rows: [
      [501, 'Laptop', 'Electronics', 4200],
      [502, 'Printer', 'Electronics', 900],
      [503, 'Desk', 'Furniture', 750],
      [504, 'Chair', 'Furniture', 300],
      [505, 'Paper', 'Stationery', 25],
    ],
  },
  {
    name: 'Orders',
    description: 'الطلبات',
    columns: [
      { name: 'OrderID', sqlType: 'NUMBER(6)', pk: true },
      { name: 'CustID', sqlType: 'NUMBER(4)', fk: 'Customer(CustID)' },
      { name: 'EmpID', sqlType: 'NUMBER(4)', fk: 'Employee(EmpID)' },
      { name: 'OrderDate', sqlType: 'DATE' },
      { name: 'Status', sqlType: 'VARCHAR2(10)' },
    ],
    rows: [
      [9001, 1, 102, '2026-01-12', 'Shipped'],
      [9002, 2, 105, '2026-01-20', 'Pending'],
      [9003, 1, 102, '2026-02-03', 'Shipped'],
      [9004, 3, 105, '2026-02-15', 'Cancelled'],
      [9005, 4, 102, '2026-03-01', 'Shipped'],
    ],
  },
  {
    name: 'OrderItem',
    description: 'بنود الطلبات',
    columns: [
      { name: 'OrderID', sqlType: 'NUMBER(6)', pk: true, fk: 'Orders(OrderID)' },
      { name: 'ProdID', sqlType: 'NUMBER(4)', pk: true, fk: 'Product(ProdID)' },
      { name: 'Qty', sqlType: 'NUMBER(4)' },
    ],
    rows: [
      [9001, 501, 2],
      [9001, 505, 10],
      [9002, 503, 1],
      [9003, 502, 1],
      [9003, 504, 4],
      [9004, 501, 1],
      [9005, 505, 20],
    ],
  },
];
