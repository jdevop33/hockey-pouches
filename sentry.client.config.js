// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Enable performance monitoring
  integrations: [
    new Sentry.BrowserTracing({
      // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/nicotinetins\.com/],
    }),
    new Sentry.Replay({
      // Additional Replay configuration goes here
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Set replaysSessionSampleRate to 1.0 to capture 100% of sessions for performance monitoring.
  // We recommend adjusting this value in production.
  replaysSessionSampleRate: 0.1,

  // Set replaysOnErrorSampleRate to 1.0 to capture 100% of sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable automatic instrumentation for Next.js routing
  autoInstrumentServerFunctions: true,
  autoInstrumentNextNavigation: true,
  
  // Capture all console logs
  beforeSend(event) {
    // Check if it is an exception, and if so, show an alert dialog
    if (event.exception && process.env.NODE_ENV === 'production') {
      console.error('An error occurred and has been reported to our team.');
    }
    return event;
  },
});
