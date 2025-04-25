/**
 * Simple monitoring utility for tracking errors and performance
 * This is a lightweight replacement for Sentry
 */
export const monitoring = {
  /**
   * Track an error
   * @param error Error to track
   * @param context Additional context
   */
  trackError: (error: Error | string, context?: Record<string, any>) => {
    console.error('Error:', error, context);
    
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'error', {
        'event_category': 'error',
        'event_label': typeof error === 'string' ? error : error.message,
        'non_interaction': true,
        ...context
      });
    }
  },

  /**
   * Track a performance metric
   * @param name Metric name
   * @param value Metric value
   * @param unit Metric unit
   * @param tags Additional tags
   */
  trackPerformance: (
    name: string,
    value: number,
    unit: 'millisecond' | 'second' | 'byte' | 'kilobyte' | 'megabyte' | 'count',
    tags?: Record<string, string>
  ) => {
    console.log(`Performance metric: ${name} = ${value} ${unit}`, tags);
    
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance', {
        'event_category': 'performance',
        'event_label': name,
        'value': value,
        'metric_unit': unit,
        ...tags
      });
    }
  },

  /**
   * Set user information for tracking
   * @param user User information
   */
  setUser: (user: { id: string; email?: string; username?: string }) => {
    console.log('Set user:', user);
    
    // Set user ID in Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', { 'user_id': user.id });
    }
  },

  /**
   * Clear user information
   */
  clearUser: () => {
    console.log('Clear user');
    
    // Clear user ID in Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', { 'user_id': undefined });
    }
  },

  /**
   * Set a tag for all future events
   * @param key Tag key
   * @param value Tag value
   */
  setTag: (key: string, value: string) => {
    console.log(`Set tag: ${key}=${value}`);
    
    // Set custom dimension in Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', { [key]: value });
    }
  },

  /**
   * Set extra context for all future events
   * @param key Context key
   * @param value Context value
   */
  setExtra: (key: string, value: any) => {
    console.log(`Set extra: ${key}=${JSON.stringify(value)}`);
  },
};
