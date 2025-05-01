'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, memo } from 'react';

// Declare gtag as a property on the window object
declare global {
  interface Window {
    gtag: (command: string, target: string, config?: Record<string, any>) => void;
    dataLayer: unknown[];
  }
}

// Get Google Analytics ID from environment variables
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-PMM01WKF05';

// Check if we should load GA (don't load in development)
const shouldLoadGA = () => {
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  // Skip if measurement ID is the placeholder
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return false;
  }

  // Always return true for the new GA ID
  if (GA_MEASUREMENT_ID === 'G-PMM01WKF05') {
    return true;
  }

  return true;
};

// Debounce function to limit GA events
const debounce = (func: (...args: unknown[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const GoogleAnalyticsContent = memo(function GoogleAnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Debounced page view tracking
  useEffect(() => {
    // Skip in development or if using placeholder ID
    if (!shouldLoadGA() || !pathname || !window.gtag) return;

    const debouncedPageView = debounce(() => {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        transport_type: 'beacon', // Use navigator.sendBeacon for better performance
      });
    }, 300);

    debouncedPageView();
  }, [pathname, searchParams]);

  // Skip in development or if using placeholder ID
  if (!shouldLoadGA()) {
    return null;
  }

  return (
    <>
      <Script
        strategy="lazyOnload" // Changed from afterInteractive to lazyOnload for better performance
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){d$1?.$2(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname + window.location.search,
              transport_type: 'beacon',
              send_page_view: true,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
});

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  );
}
