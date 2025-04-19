'use client';

import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { WebVitals } from '../_components/web-vitals';

export default function ClientAnalyticsWrapper() {
  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-PMM01WKF05`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PMM01WKF05', {
            page_path: window.location.pathname + window.location.search,
            transport_type: 'beacon',
            send_page_view: true,
            anonymize_ip: true
          });
        `}
      </Script>

      {/* Microsoft Clarity */}
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "r6bz25gfvl");
        `}
      </Script>

      {/* Web Vitals Tracking */}
      <WebVitals />

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}
