import { essay, mc, sql, tf } from './helpers';

export const q5 = [
  // l5-1 general form, order, tools
  mc('q5-01', 'l5-1', 'ترتيب تنفيذ الاستعلام في Oracle:', ['SELECT ← FROM ← WHERE ← ORDER BY', 'FROM ← WHERE ← SELECT ← ORDER BY', 'WHERE ← FROM ← SELECT ← ORDER BY', 'FROM ← SELECT ← WHERE ← ORDER BY'], 1, 'FROM ← WHERE ← SELECT ← DISTINCT ← ORDER BY.'),
  tf('q5-02', 'l5-1', 'يمكن استخدام الاسم المستعار (alias) المعرّف في SELECT داخل WHERE.', false, 'WHERE تُنفذ قبل SELECT فلا تعرف الاسم المستعار. يمكن استخدامه في ORDER BY.'),
  tf('q5-03', 'l5-1', 'يمكن استخدام الاسم المستعار في ORDER BY.', true, 'لأن ORDER BY تُنفذ بعد SELECT.'),
  mc('q5-04', 'l5-1', 'عامل دمج النصوص في Oracle:', ['+', '&', '||', 'CONCAT فقط'], 2, "first_name || ' ' || last_name"),
  mc('q5-05', 'l5-1', 'ناتج SELECT 2 + 3 * 4 FROM dual:', ['20', '14', '24', '9'], 1, 'الضرب قبل الجمع: 3×4 = 12 ثم +2 = 14.'),
  mc('q5-06', 'l5-1', 'SYSDATE - hire_date يعطي:', ['تاريخًا', 'عدد الأيام', 'عدد السنوات', 'خطأ'], 1, 'طرح تاريخين يعطي عدد الأيام، وإضافة رقم لتاريخ يعطي تاريخًا.'),
  mc('q5-07', 'l5-1', 'أين الخطأ؟ SELECT salary*12 AS annual FROM employees WHERE annual > 100000;', ['AS لا تُستخدم مع العمليات الحسابية', 'استخدام الاسم المستعار annual داخل WHERE', 'يجب كتابة ORDER BY', 'لا يوجد خطأ'], 1, 'الصحيح: WHERE salary*12 > 100000.', { kind: 'fix', d: 2 }),
  sql('q5-08', 'l5-1', 'اعرض أرقام الأقسام (department_id) من جدول employees بدون تكرار.', 'SELECT DISTINCT department_id FROM employees;', 'DISTINCT تحذف التكرار.', { d: 1 }),
  sql('q5-09', 'l5-1', "اعرض الاسم الكامل (first_name ثم مسافة ثم last_name) لموظفي القسم 60.", "SELECT first_name || ' ' || last_name FROM employees WHERE department_id = 60;", "first_name || ' ' || last_name مع WHERE department_id = 60."),
  // l5-2 WHERE, NULL, ORDER BY
  mc('q5-10', 'l5-2', 'الطريقة الصحيحة لإيجاد الموظفين بلا عمولة:', ['WHERE commission_pct = NULL', 'WHERE commission_pct IS NULL', "WHERE commission_pct = ''", 'WHERE commission_pct = 0'], 1, 'NULL تُفحص بـ IS NULL فقط.'),
  mc('q5-11', 'l5-2', 'ناتج salary * commission_pct لموظف عمولته NULL:', ['0', 'salary', 'NULL', 'خطأ'], 2, 'أي عملية حسابية فيها NULL نتيجتها NULL.'),
  mc('q5-12', 'l5-2', 'BETWEEN 2500 AND 3500:', ['لا يشمل الحدين', 'يشمل الحدين', 'يشمل الحد الأدنى فقط', 'يشمل الحد الأعلى فقط'], 1, 'BETWEEN يشمل الحدين، والأصغر يُكتب أولًا.'),
  mc('q5-13', 'l5-2', "LIKE 'S%' تعني:", ['ينتهي بـ S', 'يبدأ بـ S', 'يحتوي S في الوسط فقط', 'حرفان أولهما S'], 1, '% أي عدد من الحروف بعد S.'),
  mc('q5-14', 'l5-2', "أي نمط يطابق الأسماء التي حرفها الثاني a؟", ["'a%'", "'%a'", "'_a%'", "'%a%'"], 2, '_ حرف واحد بالضبط ثم a ثم أي شيء.', { d: 2 }),
  mc('q5-15', 'l5-2', 'أولوية العوامل المنطقية:', ['OR ثم AND ثم NOT', 'AND ثم OR ثم NOT', 'NOT ثم AND ثم OR', 'كلها متساوية'], 2, 'NOT ثم AND ثم OR، لذلك نستخدم الأقواس.'),
  mc('q5-16', 'l5-2', 'الترتيب الافتراضي في ORDER BY:', ['تنازلي DESC', 'تصاعدي ASC', 'عشوائي', 'حسب المفتاح الأساسي'], 1, 'ASC افتراضي.'),
  mc('q5-17', 'l5-2', "صحح الخطأ: SELECT * FROM employees WHERE last_name = King;", ["WHERE last_name = 'King'", 'WHERE last_name IS King', 'WHERE "King" = last_name', 'WHERE last_name LIKE King'], 0, 'النصوص بين علامتي تنصيص مفردتين.', { kind: 'fix' }),
  mc('q5-18', 'l5-2', 'صحح الخطأ: WHERE salary BETWEEN 3500 AND 2500', ['BETWEEN 2500 AND 3500', 'BETWEEN (3500, 2500)', 'IN 2500 TO 3500', 'لا خطأ'], 0, 'الأصغر يُكتب أولًا، وإلا لا تُرجع أي صف.', { kind: 'fix' }),
  mc('q5-19', 'l5-2', 'صحح الخطأ: SELECT last_name FROM employees ORDER salary;', ['ORDER BY salary', 'SORT BY salary', 'ORDER salary ASC', 'GROUP BY salary'], 0, 'الكلمة الصحيحة ORDER BY.', { kind: 'fix' }),
  tf('q5-20', 'l5-2', 'بدون ORDER BY لا يوجد ترتيب مضمون للنتائج.', true, 'كما في الملخص: بدونها لا يوجد ترتيب مضمون.'),
  sql('q5-21', 'l5-2', 'اعرض last_name للموظفين الذين ليس لهم قسم.', 'SELECT last_name FROM employees WHERE department_id IS NULL;', 'WHERE department_id IS NULL ← Grant.', { d: 1 }),
  sql('q5-22', 'l5-2', 'اعرض last_name و salary للموظفين الذين رواتبهم بين 6000 و 9000 (شاملة).', 'SELECT last_name, salary FROM employees WHERE salary BETWEEN 6000 AND 9000;', 'BETWEEN 6000 AND 9000 تشمل الحدين.'),
  sql('q5-23', 'l5-2', "اعرض last_name و job_id للموظفين الذين وظيفتهم IT_PROG أو ST_MAN.", "SELECT last_name, job_id FROM employees WHERE job_id IN ('IT_PROG', 'ST_MAN');", "IN ('IT_PROG', 'ST_MAN') أو شرطان مع OR."),
  sql('q5-24', 'l5-2', 'اعرض last_name و salary لموظفي القسم 50 مرتبين من الأعلى راتبًا.', 'SELECT last_name, salary FROM employees WHERE department_id = 50 ORDER BY salary DESC;', 'ORDER BY salary DESC في آخر الاستعلام.', { d: 2 }),
  sql('q5-25', 'l5-2', "اعرض last_name و salary لموظفي المبيعات (job_id = 'SA_REP' أو 'SA_MAN') الذين رواتبهم أكبر من 10000.", "SELECT last_name, salary FROM employees WHERE (job_id = 'SA_REP' OR job_id = 'SA_MAN') AND salary > 10000;", 'الأقواس ضرورية حول OR: Russell و Partners و Zlotkey و Abel.', { d: 3 }),
  sql('q5-26', 'l5-2', "اعرض last_name للموظفين الذين ينتهي اسمهم الأخير بالحرف s.", "SELECT last_name FROM employees WHERE last_name LIKE '%s';", "LIKE '%s' ← Matos, Vargas, Davies, Partners, Higgins.", { d: 2 }),
  essay('q5-27', 'l5-2', 'اشرح الفرق بين القيمة 0 و NULL في عمود commission_pct، وأثر كل منهما على ناتج salary * commission_pct، وكيف تبحث عن كل منهما.', '0 تعني أن القيمة مسجلة وهي صفر، فيكون الناتج 0 ونبحث عنها بـ = 0. NULL تعني أنه لا توجد قيمة أصلًا (غير معروفة)، فيكون الناتج NULL لأن أي حساب مع NULL نتيجته NULL، ونبحث عنها بـ IS NULL وليس = NULL.', ['معنى 0', 'معنى NULL', 'أثر NULL على الحساب', 'IS NULL مقابل = 0'], { d: 2 }),
  // review
  mc('q6-01', 'l6-1', 'أي زوج صحيح؟', ['Degree = عدد الصفوف', 'Cardinality = عدد الأعمدة', 'Degree = عدد الأعمدة', 'Degree = Cardinality'], 2, 'Degree أعمدة، Cardinality صفوف.'),
  mc('q6-02', 'l6-1', 'σ في الجبر العلائقي تقابل في SQL:', ['SELECT', 'WHERE', 'FROM', 'ORDER BY'], 1, 'σ (صفوف) ↔ WHERE، و π (أعمدة) ↔ SELECT.'),
  mc('q6-03', 'l6-1', 'الأصل (Cardinality) في ERD يعبر عن:', ['الحد الأدنى 0 أو 1', 'الحد الأعلى 1 أو N', 'عدد الأعمدة', 'نوع الخاصية'], 1, 'المشاركة = الحد الأدنى، الأصل = الحد الأعلى.'),
  tf('q6-04', 'l6-1', 'ACID مرتبط بالنموذج العلائقي، و BASE مرتبط بـ NoSQL.', true, 'كما في جدول «لا تخلط بين».'),
  mc('q6-05', 'l6-1', 'الاستمارة الفارغة تقابل:', ['Instance', 'Schema', 'Tuple', 'DBMS'], 1, 'Schema الاستمارة الفارغة، Instance الاستمارات المعبأة.'),
];
