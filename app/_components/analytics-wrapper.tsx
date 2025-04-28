'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AnalyticsScripts component
const DynamicAnalyticsScripts = dynamic(
  () => import('./analytics-scripts').then(mod => mod.AnalyticsScripts),
  { ssr: false }
);

export default function AnalyticsWrapper() {
  return (
    <Suspense fallback={null}>
      <DynamicAnalyticsScripts />
    </Suspense>
  );
}
