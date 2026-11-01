// A simplified subset of Oracle's HR sample schema, so the summary's examples (hr.employees, department 80, 'King')
// run as written. Values are for practice only.

import type { TableDef } from './sampleDb';

export const HR_TABLES: TableDef[] = [
  {
    name: 'departments',
    description: 'أقسام مخطط HR',
    columns: [
      { name: 'department_id', sqlType: 'NUMBER(4)', pk: true },
      { name: 'department_name', sqlType: 'VARCHAR2(30)' },
      { name: 'location_id', sqlType: 'NUMBER(4)' },
    ],
    rows: [
      [10, 'Administration', 1700],
      [20, 'Marketing', 1800],
      [50, 'Shipping', 1500],
      [60, 'IT', 1400],
      [80, 'Sales', 2500],
      [90, 'Executive', 1700],
      [110, 'Accounting', 1700],
      [190, 'Contracting', 1700],
    ],
  },
  {
    name: 'employees',
    description: 'موظفو مخطط HR (مجموعة مبسطة)',
    columns: [
      { name: 'employee_id', sqlType: 'NUMBER(6)', pk: true },
      { name: 'first_name', sqlType: 'VARCHAR2(20)' },
      { name: 'last_name', sqlType: 'VARCHAR2(25)' },
      { name: 'job_id', sqlType: 'VARCHAR2(10)' },
      { name: 'salary', sqlType: 'NUMBER(8,2)' },
      { name: 'commission_pct', sqlType: 'NUMBER(2,2)' },
      { name: 'hire_date', sqlType: 'DATE' },
      { name: 'department_id', sqlType: 'NUMBER(4)', fk: 'departments(department_id)' },
    ],
    rows: [
      [100, 'Steven', 'King', 'AD_PRES', 24000, null, '2003-06-17', 90],
      [101, 'Neena', 'Kochhar', 'AD_VP', 17000, null, '2005-09-21', 90],
      [102, 'Lex', 'De Haan', 'AD_VP', 17000, null, '2001-01-13', 90],
      [103, 'Alexander', 'Hunold', 'IT_PROG', 9000, null, '2006-01-03', 60],
      [104, 'Bruce', 'Ernst', 'IT_PROG', 6000, null, '2007-05-21', 60],
      [107, 'Diana', 'Lorentz', 'IT_PROG', 4200, null, '2007-02-07', 60],
      [124, 'Kevin', 'Mourgos', 'ST_MAN', 5800, null, '2007-11-16', 50],
      [141, 'Trenna', 'Rajs', 'ST_CLERK', 3500, null, '2003-10-17', 50],
      [142, 'Curtis', 'Davies', 'ST_CLERK', 3100, null, '2005-01-29', 50],
      [143, 'Randall', 'Matos', 'ST_CLERK', 2600, null, '2006-03-15', 50],
      [144, 'Peter', 'Vargas', 'ST_CLERK', 2500, null, '2006-07-09', 50],
      [145, 'John', 'Russell', 'SA_MAN', 14000, 0.4, '2004-10-01', 80],
      [146, 'Karen', 'Partners', 'SA_MAN', 13500, 0.3, '2005-01-05', 80],
      [149, 'Eleni', 'Zlotkey', 'SA_MAN', 10500, 0.2, '2008-01-29', 80],
      [174, 'Ellen', 'Abel', 'SA_REP', 11000, 0.3, '2004-05-11', 80],
      [176, 'Jonathon', 'Taylor', 'SA_REP', 8600, 0.2, '2006-03-24', 80],
      [178, 'Kimberely', 'Grant', 'SA_REP', 7000, 0.15, '2007-05-24', null],
      [200, 'Jennifer', 'Whalen', 'AD_ASST', 4400, null, '2003-09-17', 10],
      [201, 'Michael', 'Hartstein', 'MK_MAN', 13000, null, '2004-02-17', 20],
      [202, 'Pat', 'Fay', 'MK_REP', 6000, null, '2005-08-17', 20],
      [205, 'Shelley', 'Higgins', 'AC_MGR', 12008, null, '2002-06-07', 110],
      [206, 'William', 'Gietz', 'AC_ACCOUNT', 8300, null, '2002-06-07', 110],
    ],
  },
];
