'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { capitalizeFirstLetter } from '@/lib/utils';

interface BreadcrumbItem {
  href: string;
  label: string;
  isCurrent: boolean;
}

interface AdminBreadcrumbsProps {
  containerClasses?: string;
  customLabels?: Record<string, string>;
}

/**
 * Admin dashboard specific breadcrumbs component
 */
const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({
  containerClasses = 'mb-4 mt-2',
  customLabels = {},
}) => {
  const pathname = usePathname();

  // Build breadcrumb items from path segments
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(segment => segment !== '');

    // Always start with admin dashboard
    const breadcrumbs: BreadcrumbItem[] = [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        isCurrent: segments.length === 2 && segments[0] === 'admin' && segments[1] === 'dashboard',
      },
    ];

    // Skip the first two segments (/admin/dashboard) as they're already included
    if (segments.length > 2 && segments[0] === 'admin' && segments[1] === 'dashboard') {
      let path = '/admin/dashboard';

      for (let i = 2; i < segments.length; i++) {
        const segment = segments[i];
        path = `${path}/${segment}`;

        // Check if this is a dynamic route parameter (e.g., [id])
        const isParam = segment.match(/^\d+$/);

        // Use custom label if provided, otherwise format the segment
        let label;
        if (customLabels[path]) {
          label = customLabels[path];
        } else if (isParam) {
          label = 'Details';
        } else {
          label = segment.split('-').map(capitalizeFirstLetter).join(' ');
        }

        breadcrumbs.push({
          href: path,
          label,
          isCurrent: i === segments.length - 1,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // If only showing dashboard, don't render
  if (breadcrumbs.length === 1 && breadcrumbs[0].isCurrent) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={containerClasses}>
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, i) => (
          <li key={breadcrumb.href} className="flex items-center">
            {i > 0 && <ChevronRight className="mx-1 h-4 w-4 flex-shrink-0 text-gray-400" />}

            {i === 0 && <Home className="mr-1 h-4 w-4 text-gray-400" />}

            {breadcrumb.isCurrent ? (
              <span className="font-medium text-gold-500" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link href={breadcrumb.href} className="text-gray-400 hover:text-gold-400">
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default AdminBreadcrumbs;
