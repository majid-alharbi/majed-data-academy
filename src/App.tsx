import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import LessonPage from './pages/Lesson';
import Labs from './pages/Labs';
import NotFound from './pages/NotFound';
import ProgressPage from './pages/Progress';
import QuestionBank from './pages/QuestionBank';
import Exam from './pages/Exam';

// Heavier labs load on demand so the first page stays fast on phones.
const AlgebraLab = lazy(() => import('./pages/labs/AlgebraLab'));
const SqlLab = lazy(() => import('./pages/labs/SqlLab'));
const ErdLab = lazy(() => import('./pages/labs/ErdLab'));
const NormalizationLab = lazy(() => import('./pages/labs/NormalizationLab'));

// HashRouter keeps deep links working on GitHub Pages, which has no server-side rewrites.
export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<div className="card text-center text-slate-500">جارٍ التحميل…</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/algebra" element={<AlgebraLab />} />
            <Route path="/labs/sql" element={<SqlLab />} />
            <Route path="/labs/erd" element={<ErdLab />} />
            <Route path="/labs/normalization" element={<NormalizationLab />} />
            <Route path="/questions" element={<QuestionBank />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
}
