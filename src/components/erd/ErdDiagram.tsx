import { BaseEdge, Controls, Handle, Position, ReactFlow, type Edge, type EdgeProps, type Node, type NodeProps } from '@xyflow/react';
import { useMemo } from 'react';
import type { ErdExample } from '../../engines/erd/examples';
import type { ErdAttribute } from '../../engines/erd/model';

// Chen notation: rectangle = entity (double = weak), diamond = relationship (double = identifying),
// ellipse = attribute (underlined = key, dashed underline = partial key, double = multivalued, dashed = derived).

const ENTITY = { w: 150, h: 52 };
const REL = { w: 140, h: 76 };
const ATTR = { w: 118, h: 42 };
export const NODE_SIZE = { entity: ENTITY, rel: REL, attr: ATTR };

const centerHandles = (
  <>
    <Handle type="source" position={Position.Top} id="s" style={{ top: '50%', left: '50%', opacity: 0, pointerEvents: 'none' }} />
    <Handle type="target" position={Position.Top} id="t" style={{ top: '50%', left: '50%', opacity: 0, pointerEvents: 'none' }} />
  </>
);

type EntityData = { label: string; weak?: boolean };
type RelData = { label: string; identifying?: boolean };
type AttrData = { label: string; attr: ErdAttribute };

function EntityNode({ data }: NodeProps<Node<EntityData>>) {
  return (
    <div style={{ width: ENTITY.w, height: ENTITY.h }} className={`grid place-items-center bg-white text-sm font-semibold text-navy-900 dark:bg-navy-800 dark:text-white ${data.weak ? 'border-[5px] border-double border-navy-700 dark:border-navy-200' : 'border-2 border-navy-700 dark:border-navy-200'}`}>
      {data.label}
      {centerHandles}
    </div>
  );
}

function RelNode({ data }: NodeProps<Node<RelData>>) {
  const { w, h } = REL;
  return (
    <div style={{ width: w, height: h }} className="relative grid place-items-center text-xs font-semibold text-navy-900 dark:text-white">
      <svg width={w} height={h} className="absolute inset-0 text-navy-700 dark:text-navy-200">
        <polygon points={`${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}`} className="fill-navy-50 dark:fill-navy-800" stroke="currentColor" strokeWidth={2} />
        {data.identifying && <polygon points={`${w / 2},9 ${w - 14},${h / 2} ${w / 2},${h - 9} 14,${h / 2}`} fill="none" stroke="currentColor" strokeWidth={1.5} />}
      </svg>
      <span className="relative">{data.label}</span>
      {centerHandles}
    </div>
  );
}

function AttrNode({ data }: NodeProps<Node<AttrData>>) {
  const { w, h } = ATTR;
  const a = data.attr;
  return (
    <div style={{ width: w, height: h }} className="relative grid place-items-center text-xs text-navy-900 dark:text-white">
      <svg width={w} height={h} className="absolute inset-0 text-navy-600 dark:text-navy-200">
        <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} className="fill-white dark:fill-navy-900" stroke="currentColor" strokeWidth={1.6} strokeDasharray={a.derived ? '5 4' : undefined} />
        {a.multivalued && <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 7} ry={h / 2 - 6} fill="none" stroke="currentColor" strokeWidth={1.3} />}
      </svg>
      <span className={`relative ${a.key ? 'underline decoration-2 underline-offset-4' : ''} ${a.partialKey ? 'underline decoration-dashed decoration-2 underline-offset-4' : ''}`}>{data.label}</span>
      {centerHandles}
    </div>
  );
}

type ErdEdgeData = { total?: boolean; label?: string; bend?: number };

/**
 * Line between node centres; total participation is drawn as a double line.
 * `bend` curves the line so the two ends of a recursive relationship do not overlap.
 */
function ErdEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps<Edge<ErdEdgeData>>) {
  const bend = data?.bend ?? 0;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (sourceX + targetX) / 2 + (-dy / len) * bend;
  const cy = (sourceY + targetY) / 2 + (dx / len) * bend;
  const path = bend ? `M ${sourceX},${sourceY} Q ${cx},${cy} ${targetX},${targetY}` : `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  const mx = bend ? (sourceX + 2 * cx + targetX) / 4 : (sourceX + targetX) / 2;
  const my = bend ? (sourceY + 2 * cy + targetY) / 4 : (sourceY + targetY) / 2;
  return (
    <>
      {data?.total ? (
        <>
          <BaseEdge id={id} path={path} style={{ strokeWidth: 6, stroke: 'var(--erd-line)' }} />
          <path d={path} style={{ strokeWidth: 2, stroke: 'var(--erd-bg)', fill: 'none' }} />
        </>
      ) : (
        <BaseEdge id={id} path={path} style={{ strokeWidth: 1.6, stroke: 'var(--erd-line)' }} />
      )}
      {data?.label && (
        <g transform={`translate(${mx},${my})`}>
          <circle r={11} fill="var(--erd-bg)" stroke="var(--erd-line)" strokeWidth={1} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill="var(--erd-line)">{data.label}</text>
        </g>
      )}
    </>
  );
}

const nodeTypes = { entity: EntityNode, rel: RelNode, attr: AttrNode };
const edgeTypes = { erd: ErdEdge };

function placeAround(cx: number, cy: number, n: number, side: 'top' | 'bottom' | 'left' | 'right', dist: number) {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2);
    if (side === 'top' || side === 'bottom') out.push({ x: cx + off * 128, y: cy + (side === 'top' ? -dist : dist) });
    else out.push({ x: cx + (side === 'left' ? -dist - 40 : dist + 40), y: cy + off * 56 });
  }
  return out;
}

export function buildErdGraph(ex: ErdExample): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const centre = (name: string) => ex.layout[name] ?? { x: 0, y: 0 };
  const add = (id: string, type: 'entity' | 'rel' | 'attr', cx: number, cy: number, data: Record<string, unknown>) => {
    const size = type === 'entity' ? ENTITY : type === 'rel' ? REL : ATTR;
    nodes.push({ id, type, position: { x: cx - size.w / 2, y: cy - size.h / 2 }, data });
  };
  const addAttrs = (owner: string, attrs: ErdAttribute[]) => {
    const c = centre(owner);
    const side = c.attrSide ?? 'top';
    placeAround(c.x, c.y, attrs.length, side, 100).forEach((p, i) => {
      const a = attrs[i];
      const id = `${owner}.${a.name}`;
      add(id, 'attr', p.x, p.y, { label: a.name, attr: a });
      edges.push({ id: `e-${id}`, source: owner, target: id, type: 'erd', data: {} });
      if (a.components?.length) {
        placeAround(p.x, p.y, a.components.length, side, 70).forEach((q, j) => {
          const cid = `${id}.${a.components![j]}`;
          add(cid, 'attr', q.x, q.y, { label: a.components![j], attr: { name: a.components![j] } });
          edges.push({ id: `e-${cid}`, source: id, target: cid, type: 'erd', data: {} });
        });
      }
    });
  };

  for (const e of ex.model.entities) {
    const c = centre(e.name);
    add(e.name, 'entity', c.x, c.y, { label: e.name, weak: e.weak });
    addAttrs(e.name, e.attributes);
  }
  for (const r of ex.model.relationships) {
    const c = centre(r.name);
    add(r.name, 'rel', c.x, c.y, { label: r.name, identifying: r.identifying });
    const recursive = new Set(r.ends.map((e) => e.entity)).size < r.ends.length;
    r.ends.forEach((end, i) => {
      const bend = recursive ? (i % 2 === 0 ? 45 : -45) : 0;
      edges.push({ id: `e-${r.name}-${i}`, source: r.name, target: end.entity, type: 'erd', data: { total: end.total, label: end.cardinality, bend } });
    });
    if (r.attributes?.length) addAttrs(r.name, r.attributes);
  }
  return { nodes, edges };
}

export function ErdDiagram({ example, height = 440 }: { example: ErdExample; height?: number }) {
  const graph = useMemo(() => buildErdGraph(example), [example]);
  return (
    <div dir="ltr" style={{ height }} className="erd-canvas overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-navy-700 dark:bg-navy-900">
      <ReactFlow
        key={example.id}
        defaultNodes={graph.nodes}
        defaultEdges={graph.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export function ErdLegend() {
  const items = [
    ['مستطيل', 'كيان'],
    ['مستطيل مزدوج', 'كيان ضعيف'],
    ['معين', 'علاقة (مزدوج = تعريفية)'],
    ['بيضاوي', 'خاصية'],
    ['تحته خط', 'مفتاح (متقطع = جزئي)'],
    ['بيضاوي مزدوج', 'متعددة القيم'],
    ['بيضاوي منقط', 'مشتقة'],
    ['خط مزدوج', 'مشاركة إلزامية'],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
      {items.map(([a, b]) => (
        <div key={a}><span className="font-semibold text-navy-700 dark:text-navy-100">{a}</span>: {b}</div>
      ))}
    </div>
  );
}
