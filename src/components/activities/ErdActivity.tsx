import { ErdDiagram, ErdLegend } from '../erd/ErdDiagram';
import { exampleById, MappingView } from '../tools/MappingView';

export default function ErdActivity({ mode, example }: { mode: 'erd' | 'mapping'; example: string }) {
  const ex = exampleById(example);
  if (mode === 'mapping') return <MappingView example={ex} />;
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-slate-50 p-3 text-sm leading-7 dark:bg-navy-900"><span className="font-semibold">المتطلبات: </span>{ex.story}</p>
      <ErdDiagram example={ex} />
      <ErdLegend />
    </div>
  );
}
