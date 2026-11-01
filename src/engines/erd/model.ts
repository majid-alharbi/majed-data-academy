// ERD model (Chen notation) and the rule-based mapping to a relational schema.
// Rules follow the course summary, chapter 4, and Elmasri & Navathe's mapping algorithm.

export interface ErdAttribute {
  name: string;
  key?: boolean; // key attribute (underlined)
  partialKey?: boolean; // partial key of a weak entity (dashed underline)
  multivalued?: boolean; // double ellipse
  derived?: boolean; // dashed ellipse
  components?: string[]; // composite attribute
}

export interface ErdEntity {
  name: string;
  weak?: boolean;
  attributes: ErdAttribute[];
}

export type Cardinality = '1' | 'N' | 'M';

export interface RelationshipEnd {
  entity: string;
  cardinality: Cardinality;
  total?: boolean; // total participation (min = 1)
  role?: string; // role name, needed for recursive relationships
}

export interface ErdRelationship {
  name: string;
  identifying?: boolean; // links a weak entity to its owner
  ends: RelationshipEnd[];
  attributes?: ErdAttribute[];
}

export interface ErdModel {
  entities: ErdEntity[];
  relationships: ErdRelationship[];
}

export interface RmColumn {
  name: string;
  pk?: boolean;
  fk?: { table: string; column: string };
}

export interface RmTable {
  name: string;
  columns: RmColumn[];
  /** Which mapping rule created or changed this table (Arabic). */
  notes: string[];
}

export class ErdError extends Error {}

function simpleColumns(attrs: ErdAttribute[]): { name: string; key: boolean }[] {
  const out: { name: string; key: boolean }[] = [];
  for (const a of attrs) {
    if (a.derived || a.multivalued) continue;
    if (a.components?.length) a.components.forEach((c) => out.push({ name: c, key: !!(a.key || a.partialKey) }));
    else out.push({ name: a.name, key: !!(a.key || a.partialKey) });
  }
  return out;
}

export function relationshipKind(r: ErdRelationship): '1:1' | '1:N' | 'M:N' {
  const [a, b] = r.ends.map((e) => e.cardinality);
  if (a === '1' && b === '1') return '1:1';
  if (a === '1' || b === '1') return '1:N';
  return 'M:N';
}

export function mapErdToRm(model: ErdModel): RmTable[] {
  const tables = new Map<string, RmTable>();
  const entity = (n: string) => {
    const e = model.entities.find((x) => x.name === n);
    if (!e) throw new ErdError(`الكيان «${n}» غير معرّف`);
    return e;
  };
  const pkOf = (table: string) => {
    const t = tables.get(table);
    if (!t) throw new ErdError(`لا يمكن تحديد المفتاح الأساسي لـ ${table}`);
    return t.columns.filter((c) => c.pk);
  };
  const addColumn = (t: RmTable, col: RmColumn) => {
    let name = col.name;
    while (t.columns.some((c) => c.name.toLowerCase() === name.toLowerCase())) name = `${col.fk?.table ?? 'X'}_${name}`;
    t.columns.push({ ...col, name });
  };

  // Rule 1: strong entities.
  for (const e of model.entities.filter((x) => !x.weak)) {
    const cols = simpleColumns(e.attributes);
    if (!cols.some((c) => c.key)) throw new ErdError(`الكيان القوي «${e.name}» يحتاج خاصية مفتاحية`);
    tables.set(e.name, {
      name: e.name,
      columns: cols.map((c) => ({ name: c.name, pk: c.key })),
      notes: ['كيان قوي ← جدول مستقل بمفتاحه الأساسي'],
    });
    if (e.attributes.some((a) => a.components?.length)) tables.get(e.name)!.notes.push('الخاصية المركبة ← كل جزء منها عمود مستقل');
    if (e.attributes.some((a) => a.derived)) tables.get(e.name)!.notes.push('الخاصية المشتقة لا تُخزَّن');
  }

  // Rule 2: weak entities (owner key + partial key). Owners may themselves be weak, so iterate until stable.
  const weak = model.entities.filter((x) => x.weak);
  let pending = [...weak];
  while (pending.length) {
    const before = pending.length;
    pending = pending.filter((e) => {
      const rel = model.relationships.find((r) => r.identifying && r.ends.some((end) => end.entity === e.name));
      if (!rel) throw new ErdError(`الكيان الضعيف «${e.name}» يحتاج علاقة تعريفية مع مالكه`);
      const owner = rel.ends.find((end) => end.entity !== e.name)!.entity;
      if (!tables.has(owner)) return true;
      const t: RmTable = { name: e.name, columns: [], notes: [`كيان ضعيف ← مفتاحه = مفتاح المالك (${owner}) + مفتاحه الجزئي`] };
      for (const c of pkOf(owner)) addColumn(t, { name: c.name, pk: true, fk: { table: owner, column: c.name } });
      for (const c of simpleColumns(e.attributes)) addColumn(t, { name: c.name, pk: c.key });
      tables.set(e.name, t);
      return false;
    });
    if (pending.length === before) throw new ErdError('تعذّر تحديد مالك الكيانات الضعيفة');
  }

  const relAttrs = (r: ErdRelationship) => simpleColumns(r.attributes ?? []).map((c) => ({ name: c.name }));

  for (const r of model.relationships.filter((x) => !x.identifying)) {
    if (r.ends.length !== 2) {
      // Rule: n-ary relationship → new table holding the keys of all participants.
      const t: RmTable = { name: r.name, columns: [], notes: [`علاقة ${r.ends.length === 3 ? 'ثلاثية' : 'متعددة'} ← جدول جديد يحمل مفاتيح كل الكيانات`] };
      for (const end of r.ends) for (const c of pkOf(entity(end.entity).name)) addColumn(t, { name: c.name, pk: true, fk: { table: end.entity, column: c.name } });
      relAttrs(r).forEach((c) => addColumn(t, c));
      tables.set(r.name, t);
      continue;
    }
    const kind = relationshipKind(r);
    const [a, b] = r.ends;
    const recursive = a.entity === b.entity;

    if (kind === 'M:N') {
      const t: RmTable = { name: r.name, columns: [], notes: ['علاقة M:N ← جدول وسيط مفتاحه مركب من مفتاحي الطرفين'] };
      for (const end of r.ends) {
        for (const c of pkOf(end.entity)) {
          addColumn(t, { name: recursive && end.role ? `${end.role}_${c.name}` : c.name, pk: true, fk: { table: end.entity, column: c.name } });
        }
      }
      relAttrs(r).forEach((c) => addColumn(t, c));
      tables.set(r.name, t);
      continue;
    }

    // 1:N → FK on the N side. 1:1 → FK on the side with total participation (fewer NULLs).
    let host: RelationshipEnd;
    let ref: RelationshipEnd;
    if (kind === '1:N') {
      host = a.cardinality === '1' ? b : a;
      ref = host === a ? b : a;
    } else {
      host = b.total && !a.total ? b : a.total ? a : b;
      ref = host === a ? b : a;
    }
    const t = tables.get(host.entity)!;
    for (const c of pkOf(ref.entity)) {
      // In a recursive relationship the new column is named after the role it points to (e.g. Supervisor_EmpID).
      const name = recursive ? `${ref.role ?? r.name}_${c.name}` : c.name;
      addColumn(t, { name, fk: { table: ref.entity, column: c.name } });
    }
    relAttrs(r).forEach((c) => addColumn(t, c));
    t.notes.push(
      recursive
        ? `علاقة دائرية «${r.name}» ← عمود جديد في نفس الجدول يشير إلى مفتاحه`
        : kind === '1:N'
          ? `علاقة 1:N «${r.name}» ← مفتاح ${ref.entity} أجنبي في جهة N`
          : `علاقة 1:1 «${r.name}» ← مفتاح ${ref.entity} أجنبي في جهة المشاركة الإلزامية`,
    );
  }

  // Rule: multivalued attributes → separate table with the owner's key.
  const owners: { name: string; attrs: ErdAttribute[] }[] = model.entities.map((e) => ({ name: e.name, attrs: e.attributes }));
  for (const o of owners) {
    for (const mv of o.attrs.filter((x) => x.multivalued)) {
      const t: RmTable = { name: `${o.name}_${mv.name}`, columns: [], notes: [`خاصية متعددة القيم «${mv.name}» ← جدول منفصل يحمل مفتاح ${o.name}`] };
      for (const c of pkOf(o.name)) addColumn(t, { name: c.name, pk: true, fk: { table: o.name, column: c.name } });
      addColumn(t, { name: mv.name, pk: true });
      tables.set(t.name, t);
    }
  }

  return [...tables.values()];
}

/** Text form used in the course summary: Table(PK, other columns). */
export function tableToString(t: RmTable): string {
  return `${t.name}(${t.columns.map((c) => (c.pk ? `_${c.name}_` : c.name) + (c.fk ? '*' : '')).join(', ')})`;
}
