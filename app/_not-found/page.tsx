import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found - Hockey Pouches',
  description: 'The page you are looking for does not exist.'};

export const viewport: Viewport = {
  themeColor: '#000',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-5xl font-bold md:text-7xl">404</h1>
      <p className="mb-8 text-xl md:text-2xl">Page not found</p>
      <p className="mb-8 max-w-md text-base md:text-lg">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Button>
        <Link href="/" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to homepage
        </Link>
      </Button>
    </div>
  );
}
