import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card space-y-3 text-center">
      <p className="text-4xl font-bold text-navy-700 dark:text-white">404</p>
      <p>الصفحة غير موجودة.</p>
      <Link to="/" className="btn-primary">إلى الرئيسية</Link>
    </div>
  );
}
