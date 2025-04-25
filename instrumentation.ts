// This file is used to register any instrumentation code.
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

// Initialize analytics before the app starts
export function register() {
  if (typeof window !== 'undefined') {
    // Set up global error tracking
    window.addEventListener('error', event => {
      // Send to your error tracking service
      console.error('Captured error:', event.error);

      // Send to Google Analytics if available
      if (window.gtag) {
        window.gtag('event', 'javascript_error', {
          event_category: 'error',
          event_label: event.error ? event.error.message : 'Unknown error',
          non_interaction: true,
        });
      }
    });

    // Set up unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', event => {
      // Send to your error tracking service
      console.error('Unhandled promise rejection:', event.reason);

      // Send to Google Analytics if available
      if (window.gtag) {
        window.gtag('event', 'unhandled_promise_rejection', {
          event_category: 'error',
          event_label: event.reason ? event.reason.message : 'Unknown reason',
          non_interaction: true,
        });
      }
    });
  }
}
