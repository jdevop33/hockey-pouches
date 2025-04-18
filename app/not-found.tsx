import Link from 'next/link';
import Layout from './components/layout/NewLayout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary-600">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-md bg-primary-600 px-6 py-3 text-white shadow-md hover:bg-primary-700"
        >
          Return Home
        </Link>
      </div>
    </Layout>
  );
}
