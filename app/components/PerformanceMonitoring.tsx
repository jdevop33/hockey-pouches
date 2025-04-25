'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { monitoring } from '@/lib/monitoring';

/**
 * Track web vitals
 */
function trackWebVitals() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track First Contentful Paint (FCP)
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          monitoring.trackPerformance('web.fcp', entry.startTime, 'millisecond');
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });

    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      monitoring.trackPerformance('web.lcp', lastEntry.startTime, 'millisecond');
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        // Use type assertion to access processingStart property
        const fidEntry = entry as PerformanceEventTiming;
        monitoring.trackPerformance(
          'web.fid',
          fidEntry.processingStart - fidEntry.startTime,
          'millisecond'
        );
      });
    });

    fidObserver.observe({ type: 'first-input', buffered: true });

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const clsObserver = new PerformanceObserver(list => {
      clsEntries = clsEntries.concat(list.getEntries());

      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];
      let sessionStart = 0;

      clsEntries.forEach(entry => {
        // @ts-ignore - layout shift entry
        if (!sessionStart || entry.startTime - sessionStart > 5000) {
          sessionStart = entry.startTime;
          sessionValue = 0;
          sessionEntries = [];
        }

        // @ts-ignore - layout shift entry
        sessionValue += entry.value;
        sessionEntries.push(entry);

        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          monitoring.trackPerformance('web.cls', clsValue, 'count');
        }
      });
    });

    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Track Time to First Byte (TTFB)
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
      monitoring.trackPerformance('web.ttfb', navigationEntry.responseStart, 'millisecond');
    }

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }
}

/**
 * Track page views
 */
function trackPageView(pathname: string, searchParams: URLSearchParams) {
  const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated to ${url}`,
    level: 'info',
  });

  // Track page view
  monitoring.setTag('page.path', pathname);
  monitoring.setTag('page.url', url);
}

/**
 * Track user interactions
 */
function trackUserInteractions() {
  if (typeof window !== 'undefined') {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickedElement = target.tagName.toLowerCase();
      const elementId = target.id ? `#${target.id}` : '';
      const elementClass =
        target.className && typeof target.className === 'string'
          ? `.${target.className.split(' ').join('.')}`
          : '';
      const elementText = target.textContent ? target.textContent.substring(0, 20) : '';

      Sentry.addBreadcrumb({
        category: 'ui.click',
        message: `Clicked on ${clickedElement}${elementId}${elementClass} "${elementText}"`,
        level: 'info',
      });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }
}

/**
 * Inner component that uses useSearchParams
 */
function PerformanceMonitoringContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track web vitals
    const cleanupWebVitals = trackWebVitals();

    // Track page views
    trackPageView(pathname, searchParams);

    // Track user interactions
    const cleanupUserInteractions = trackUserInteractions();

    return () => {
      if (cleanupWebVitals) cleanupWebVitals();
      if (cleanupUserInteractions) cleanupUserInteractions();
    };
  }, [pathname, searchParams]);

  return null;
}

/**
 * Performance monitoring component with Suspense boundary
 */
import { Suspense } from 'react';

export default function PerformanceMonitoring() {
  return (
    <Suspense fallback={null}>
      <PerformanceMonitoringContent />
    </Suspense>
  );
}
