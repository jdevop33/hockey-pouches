'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify(metric)
    
    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body)
    } else {
      fetch('/api/analytics', { body, method: 'POST', keepalive: true })
    }

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ), // values must be integers
        event_label: metric.id, // id unique to current page load
        non_interaction: true, // avoids affecting bounce rate
      })
    }
  })
  
  return null
}
