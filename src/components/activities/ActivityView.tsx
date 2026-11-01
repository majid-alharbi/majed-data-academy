import { lazy, Suspense } from 'react';
import type { Activity } from '../../content/types';
import { NormalizationTool } from '../tools/NormalizationTool';
import { RaWorkbench } from '../tools/RaWorkbench';
import { SqlRunner } from '../tools/SqlRunner';
import { FileVsDb, Integrity, KeysExplorer, Levels, TableAnatomy } from './Concepts';
import { Classify, Flashcards, OrderGame } from './Generic';

// React Flow is only needed for ERD lessons.
const ErdActivity = lazy(() => import('./ErdActivity'));

export function ActivityView({ activity }: { activity: Activity }) {
  switch (activity.widget) {
    case 'flashcards': return <Flashcards title={activity.title} cards={activity.cards} />;
    case 'classify': return <Classify title={activity.title} buckets={activity.buckets} items={activity.items} />;
    case 'order': return <OrderGame title={activity.title} correct={activity.correct} why={activity.why} />;
    case 'file-vs-db': return <FileVsDb />;
    case 'levels': return <Levels />;
    case 'table-anatomy': return <TableAnatomy />;
    case 'keys': return <KeysExplorer />;
    case 'integrity': return <Integrity />;
    case 'ra': return <RaWorkbench presets={activity.presets} />;
    case 'normalization': return <NormalizationTool preset={activity.preset} />;
    case 'sql': return <SqlRunner presets={activity.presets} />;
    case 'erd':
    case 'mapping':
      return (
        <Suspense fallback={<p className="text-sm text-slate-500">جارٍ تحميل المخطط…</p>}>
          <ErdActivity mode={activity.widget} example={activity.example} />
        </Suspense>
      );
  }
}
