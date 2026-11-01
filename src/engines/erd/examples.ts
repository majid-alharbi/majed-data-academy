import type { ErdModel } from './model';

export interface ErdExample {
  id: string;
  title: string;
  story: string;
  model: ErdModel;
  /** Positions of entities and relationships; attributes are placed automatically around their owner. */
  layout: Record<string, { x: number; y: number; attrSide?: 'top' | 'bottom' | 'left' | 'right' }>;
}

export const ERD_EXAMPLES: ErdExample[] = [
  {
    id: 'store',
    title: 'متجر: العملاء والطلبات',
    story:
      'العميل يقدّم عدة طلبات، وكل طلب يخص عميلًا واحدًا إلزاميًا. الطلب يحتوي عدة منتجات، والمنتج يظهر في عدة طلبات، ونسجل الكمية لكل منتج داخل الطلب.',
    model: {
      entities: [
        { name: 'Customers', attributes: [{ name: 'CustomerID', key: true }, { name: 'Name' }, { name: 'City' }] },
        { name: 'Orders', attributes: [{ name: 'OrderID', key: true }, { name: 'Date' }] },
        { name: 'Products', attributes: [{ name: 'ProductID', key: true }, { name: 'Name' }, { name: 'Price' }] },
      ],
      relationships: [
        { name: 'Places', ends: [{ entity: 'Customers', cardinality: '1' }, { entity: 'Orders', cardinality: 'N', total: true }] },
        {
          name: 'OrderDetails',
          ends: [{ entity: 'Orders', cardinality: 'M', total: true }, { entity: 'Products', cardinality: 'N' }],
          attributes: [{ name: 'Quantity' }],
        },
      ],
    },
    layout: {
      Customers: { x: 760, y: 220, attrSide: 'top' },
      Places: { x: 540, y: 220 },
      Orders: { x: 320, y: 220, attrSide: 'top' },
      OrderDetails: { x: 320, y: 420, attrSide: 'right' },
      Products: { x: 320, y: 620, attrSide: 'bottom' },
    },
  },
  {
    id: 'company',
    title: 'شركة: الموظفون والفروع',
    story:
      'لكل موظف رقم واسم مركب (أول، أخير) وتاريخ ميلاد، والعمر يُحسب منه، وله عدة أرقام جوال. كل موظف يعمل في فرع واحد إلزاميًا، وكل فرع يديره موظف واحد (كل فرع يجب أن يكون له مدير، وليس كل موظف مديرًا). الموظف قد يشرف على موظفين آخرين. للموظف أبناء لا يُعرَّفون إلا من خلاله.',
    model: {
      entities: [
        {
          name: 'Employee',
          attributes: [
            { name: 'EmpID', key: true },
            { name: 'Name', components: ['FirstName', 'LastName'] },
            { name: 'BirthDate' },
            { name: 'Age', derived: true },
            { name: 'Phone', multivalued: true },
          ],
        },
        { name: 'Branch', attributes: [{ name: 'BranchID', key: true }, { name: 'BranchName' }, { name: 'City' }] },
        { name: 'Dependent', weak: true, attributes: [{ name: 'DepName', partialKey: true }, { name: 'Relation' }] },
      ],
      relationships: [
        { name: 'WorksIn', ends: [{ entity: 'Employee', cardinality: 'N', total: true }, { entity: 'Branch', cardinality: '1' }] },
        {
          name: 'Manages',
          ends: [{ entity: 'Employee', cardinality: '1' }, { entity: 'Branch', cardinality: '1', total: true }],
          attributes: [{ name: 'StartDate' }],
        },
        {
          name: 'Supervises',
          ends: [
            { entity: 'Employee', cardinality: '1', role: 'Supervisor' },
            { entity: 'Employee', cardinality: 'N', role: 'Supervisee' },
          ],
        },
        {
          name: 'HasDependent',
          identifying: true,
          ends: [{ entity: 'Employee', cardinality: '1' }, { entity: 'Dependent', cardinality: 'N', total: true }],
        },
      ],
    },
    layout: {
      Employee: { x: 480, y: 300, attrSide: 'top' },
      WorksIn: { x: 160, y: 300 },
      Manages: { x: 160, y: 470, attrSide: 'left' },
      Branch: { x: -140, y: 385, attrSide: 'left' },
      Supervises: { x: 760, y: 300 },
      HasDependent: { x: 480, y: 520 },
      Dependent: { x: 480, y: 700, attrSide: 'bottom' },
    },
  },
  {
    id: 'university',
    title: 'جامعة: الطلاب والمواد',
    story:
      'الطالب يسجل في عدة مواد والمادة يسجل فيها عدة طلاب، والدرجة تخص الطالب في هذه المادة. كل طالب ينتمي إلى قسم واحد إلزاميًا. كل قسم يرأسه عضو هيئة تدريس واحد، وعضو هيئة التدريس قد يرأس قسمًا واحدًا على الأكثر.',
    model: {
      entities: [
        { name: 'Student', attributes: [{ name: 'StudentID', key: true }, { name: 'SName' }, { name: 'GPA' }] },
        { name: 'Course', attributes: [{ name: 'CourseID', key: true }, { name: 'Title' }, { name: 'Credits' }] },
        { name: 'Department', attributes: [{ name: 'DeptID', key: true }, { name: 'DName' }] },
        { name: 'Faculty', attributes: [{ name: 'FacID', key: true }, { name: 'FName' }] },
      ],
      relationships: [
        {
          name: 'Enrollment',
          ends: [{ entity: 'Student', cardinality: 'M' }, { entity: 'Course', cardinality: 'N' }],
          attributes: [{ name: 'Grade' }],
        },
        { name: 'BelongsTo', ends: [{ entity: 'Student', cardinality: 'N', total: true }, { entity: 'Department', cardinality: '1' }] },
        { name: 'Heads', ends: [{ entity: 'Faculty', cardinality: '1' }, { entity: 'Department', cardinality: '1', total: true }] },
      ],
    },
    layout: {
      Course: { x: 760, y: 200, attrSide: 'top' },
      Enrollment: { x: 520, y: 200, attrSide: 'bottom' },
      Student: { x: 280, y: 200, attrSide: 'top' },
      BelongsTo: { x: 280, y: 400 },
      Department: { x: 280, y: 600, attrSide: 'bottom' },
      Heads: { x: 540, y: 600 },
      Faculty: { x: 780, y: 600, attrSide: 'bottom' },
    },
  },
  {
    id: 'clinic',
    title: 'عيادة: علاقة ثلاثية',
    story: 'الطبيب يصف دواءً لمريض. الوصفة لا تخص طرفين فقط، بل الثلاثة معًا، ونسجل تاريخ الوصفة.',
    model: {
      entities: [
        { name: 'Doctor', attributes: [{ name: 'DoctorID', key: true }, { name: 'DName' }] },
        { name: 'Patient', attributes: [{ name: 'PatientID', key: true }, { name: 'PName' }] },
        { name: 'Drug', attributes: [{ name: 'DrugCode', key: true }, { name: 'DrugName' }] },
      ],
      relationships: [
        {
          name: 'Prescribes',
          ends: [
            { entity: 'Doctor', cardinality: 'M' },
            { entity: 'Patient', cardinality: 'N' },
            { entity: 'Drug', cardinality: 'N' },
          ],
          attributes: [{ name: 'RxDate' }],
        },
      ],
    },
    layout: {
      Doctor: { x: 700, y: 200, attrSide: 'top' },
      Prescribes: { x: 420, y: 320, attrSide: 'bottom' },
      Patient: { x: 140, y: 200, attrSide: 'top' },
      Drug: { x: 420, y: 560, attrSide: 'bottom' },
    },
  },
];
