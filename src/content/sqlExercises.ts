// Auto-graded SQL exercises. Each solution is executed in tests, and student answers are graded by comparing
// their result with the solution's result on the same data.

export interface SqlExercise {
  id: string;
  title: string;
  prompt: string;
  solution: string;
  /** True when row order is part of the answer (the solution uses ORDER BY). */
  ordered?: boolean;
  hint: string;
  explanation: string;
}

export const SQL_EXERCISES: SqlExercise[] = [
  {
    id: 'sql-all',
    title: 'كل الأعمدة',
    prompt: 'اعرض كل أعمدة جدول departments.',
    solution: 'SELECT * FROM departments;',
    hint: 'النجمة * تعني كل الأعمدة.',
    explanation: 'SELECT * يعرض جميع الأعمدة بالترتيب الذي عُرّفت به في الجدول.',
  },
  {
    id: 'sql-where-num',
    title: 'شرط رقمي',
    prompt: 'اعرض last_name و salary للموظفين الذين رواتبهم أكبر من 10000.',
    solution: 'SELECT last_name, salary FROM employees WHERE salary > 10000;',
    hint: 'استخدم WHERE salary > 10000',
    explanation: 'WHERE تختار الصفوف (مثل σ)، وSELECT تختار الأعمدة (مثل π).',
  },
  {
    id: 'sql-where-text',
    title: 'شرط نصي',
    prompt: "اعرض first_name و job_id للموظف الذي اسمه الأخير King.",
    solution: "SELECT first_name, job_id FROM employees WHERE last_name = 'King';",
    hint: 'النصوص تُكتب بين علامتي تنصيص مفردتين.',
    explanation: "الخطأ الشائع: last_name = King بدون علامات تنصيص، فيعتبرها النظام اسم عمود.",
  },
  {
    id: 'sql-between',
    title: 'BETWEEN',
    prompt: 'اعرض last_name و salary للموظفين الذين رواتبهم من 2500 إلى 3500 (شاملة الحدين).',
    solution: 'SELECT last_name, salary FROM employees WHERE salary BETWEEN 2500 AND 3500;',
    hint: 'BETWEEN يشمل الحدين، والأصغر يُكتب أولًا.',
    explanation: 'BETWEEN 3500 AND 2500 لا تُرجع شيئًا لأن الحد الأدنى يجب أن يأتي أولًا.',
  },
  {
    id: 'sql-in',
    title: 'IN',
    prompt: 'اعرض last_name و department_id لموظفي الأقسام 10 و 20 و 110.',
    solution: 'SELECT last_name, department_id FROM employees WHERE department_id IN (10, 20, 110);',
    hint: 'IN اختصار لعدة شروط OR.',
    explanation: 'IN (10, 20, 110) تكافئ department_id = 10 OR department_id = 20 OR department_id = 110.',
  },
  {
    id: 'sql-like',
    title: 'LIKE',
    prompt: 'اعرض last_name لكل موظف يبدأ اسمه الأخير بالحرف H.',
    solution: "SELECT last_name FROM employees WHERE last_name LIKE 'H%';",
    hint: '% تعني أي عدد من الحروف.',
    explanation: "'H%' تعني: يبدأ بـ H ثم أي شيء. و _ تعني حرفًا واحدًا بالضبط.",
  },
  {
    id: 'sql-null',
    title: 'IS NULL',
    prompt: 'اعرض last_name للموظفين الذين ليس لهم قسم (department_id فارغ).',
    solution: 'SELECT last_name FROM employees WHERE department_id IS NULL;',
    hint: 'لا تكتب = NULL',
    explanation: 'المقارنة مع NULL بعلامة = لا تكون صحيحة أبدًا، لذا نستخدم IS NULL.',
  },
  {
    id: 'sql-and-or',
    title: 'AND و OR مع الأقواس',
    prompt: "اعرض last_name و job_id و salary للموظفين الذين وظيفتهم SA_REP أو AD_PRES ورواتبهم أكبر من 15000.",
    solution: "SELECT last_name, job_id, salary FROM employees WHERE (job_id = 'SA_REP' OR job_id = 'AD_PRES') AND salary > 15000;",
    hint: 'AND تُنفّذ قبل OR، فاستخدم الأقواس.',
    explanation: 'بدون أقواس سيُفهم الشرط: SA_REP (بأي راتب) أو (AD_PRES وراتبه > 15000)، فتظهر صفوف زائدة.',
  },
  {
    id: 'sql-order',
    title: 'ORDER BY تنازلي',
    prompt: 'المثال الكامل من الملخص: موظفو القسم 80 الذين رواتبهم فوق 10000، مرتبين من الأعلى راتبًا (last_name, salary).',
    solution: 'SELECT last_name, salary FROM hr.employees WHERE department_id = 80 AND salary > 10000 ORDER BY salary DESC;',
    ordered: true,
    hint: 'DESC للترتيب التنازلي، وORDER BY في آخر الاستعلام.',
    explanation: 'ترتيب التنفيذ: FROM ← WHERE ← SELECT ← ORDER BY.',
  },
  {
    id: 'sql-alias',
    title: 'اسم مستعار وعملية حسابية',
    prompt: 'اعرض last_name والراتب السنوي salary*12 باسم annual_salary لموظفي القسم 60، مرتبة حسب annual_salary تصاعديًا.',
    solution: 'SELECT last_name, salary * 12 AS annual_salary FROM employees WHERE department_id = 60 ORDER BY annual_salary;',
    ordered: true,
    hint: 'يمكن استخدام الاسم المستعار في ORDER BY لكن ليس في WHERE.',
    explanation: 'لأن ORDER BY تُنفذ بعد SELECT فهي تعرف الاسم المستعار، أما WHERE فتُنفذ قبلها.',
  },
  {
    id: 'sql-concat',
    title: 'دمج النصوص',
    prompt: "اعرض الاسم الكامل first_name || ' ' || last_name لموظفي القسم 90.",
    solution: "SELECT first_name || ' ' || last_name AS full_name FROM employees WHERE department_id = 90;",
    hint: 'عامل الدمج في Oracle هو ||',
    explanation: "|| يدمج النصوص، و' ' تضيف مسافة بين الاسمين.",
  },
  {
    id: 'sql-distinct',
    title: 'DISTINCT',
    prompt: 'اعرض أرقام الأقسام الموجودة في جدول employees بدون تكرار.',
    solution: 'SELECT DISTINCT department_id FROM employees;',
    hint: 'DISTINCT تحذف التكرار.',
    explanation: 'لاحظ أن NULL يظهر مرة واحدة كقيمة مستقلة في النتيجة.',
  },
  {
    id: 'sql-null-arith',
    title: 'NULL في الحساب',
    prompt: 'اعرض last_name و salary * commission_pct لموظفي القسم 50. لاحظ النتيجة.',
    solution: 'SELECT last_name, salary * commission_pct FROM employees WHERE department_id = 50;',
    hint: 'أي عملية حسابية فيها NULL نتيجتها NULL.',
    explanation: 'موظفو القسم 50 ليس لهم عمولة (NULL)، لذا ناتج الضرب NULL لكل منهم.',
  },
  {
    id: 'sql-join',
    title: 'ربط جدولين (JOIN)',
    prompt: 'اعرض last_name و department_name لكل موظف له قسم.',
    solution: 'SELECT e.last_name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.department_id;',
    hint: 'اربط على العمود المشترك department_id.',
    explanation: 'الربط الداخلي يعرض المتطابق فقط، لذلك لا يظهر Grant (بلا قسم) ولا قسم Contracting (بلا موظفين).',
  },
  {
    id: 'sql-minus',
    title: 'الفرق MINUS',
    prompt: 'اعرض أرقام الأقسام التي لا يعمل فيها أي موظف (استخدم MINUS).',
    solution: 'SELECT department_id FROM departments MINUS SELECT department_id FROM employees;',
    hint: 'الموجود في الأول وليس في الثاني.',
    explanation: 'MINUS في Oracle تقابل عملية الفرق − في الجبر العلائقي.',
  },
];
