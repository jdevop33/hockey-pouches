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

interface BreadcrumbsProps {
  homeElement?: React.ReactNode;
  separator?: React.ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  inactiveClasses?: string;
  customLabels?: Record<string, string>;
}

/**
 * A breadcrumb navigation component that automatically generates breadcrumbs based on the current path
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  homeElement = <Home className="mr-1 h-4 w-4" />,
  separator = <ChevronRight className="mx-2 h-4 w-4 flex-shrink-0 text-gray-400" />,
  containerClasses = 'flex py-4',
  listClasses = 'flex items-center',
  activeClasses = 'text-gold-500 font-semibold',
  inactiveClasses = 'text-gray-300 hover:text-gold-400',
  customLabels = {},
}) => {
  const pathname = usePathname();

  // Skip rendering if on homepage
  if (pathname === '/') {
    return null;
  }

  // Build breadcrumb items from path segments
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = $1?.$2('/').filter(segment => segment !== '');

    // Always start with home
    const breadcrumbs: BreadcrumbItem[] = [
      {
        href: '/',
        label: 'Home',
        isCurrent: $1?.$2h === 0,
      },
    ];

    // Add path segments as breadcrumbs
    let path = '';
    segments.forEach((segment, i) => {
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
    });

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className={containerClasses}>
      <ol className={listClasses}>
        {$1?.$2((breadcrumb, i) => (
          <li key={breadcrumb.href} className="flex items-center">
            {i > 0 && separator}

            {breadcrumb.isCurrent ? (
              <span className={activeClasses} aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link href={breadcrumb.href} className={inactiveClasses}>
                {i === 0 ? (
                  <span className="flex items-center">
                    {homeElement} {breadcrumb.label}
                  </span>
                ) : (
                  breadcrumb.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
