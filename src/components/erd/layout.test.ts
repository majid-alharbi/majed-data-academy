import { describe, expect, it } from 'vitest';
import { ERD_EXAMPLES } from '../../engines/erd/examples';
import { buildErdGraph, NODE_SIZE } from './ErdDiagram';

describe('ERD layouts', () => {
  for (const ex of ERD_EXAMPLES) {
    it(`${ex.id}: no two shapes overlap`, () => {
      const boxes = buildErdGraph(ex).nodes.map((n) => {
        const s = NODE_SIZE[n.type as keyof typeof NODE_SIZE];
        return { id: n.id, x1: n.position.x, y1: n.position.y, x2: n.position.x + s.w, y2: n.position.y + s.h };
      });
      const overlaps: string[] = [];
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          if (a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2) overlaps.push(`${a.id} / ${b.id}`);
        }
      }
      expect(overlaps).toEqual([]);
    });
  }
});
