'use client';

import Script from 'next/script';

// Analytics tracking IDs - configured for production deployment
const GA_TRACKING_ID = 'G-PMM01WKF05';
const CLARITY_TRACKING_ID = 'r6bz25gfvl';

export function AnalyticsScripts() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname + window.location.search,
              transport_type: 'beacon',
              send_page_view: true,
              anonymize_ip: true
            });
          `,
        }}
      />
      <Script
        id="clarity-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_TRACKING_ID}");
          `,
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': 'https://nicotinetins.com/#website',
            url: 'https://nicotinetins.com',
            name: 'Nicotine Tins by PUXX',
            description:
              'Premium tobacco-free nicotine pouches designed for discerning adults across Canada. Discreet, convenient, and perfect for your active lifestyle.',
            potentialAction: [
              {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://nicotinetins.com/products?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            ],
            publisher: {
              '@type': 'Organization',
              name: 'Nicotine Tins by PUXX',
              logo: {
                '@type': 'ImageObject',
                url: 'https://nicotinetins.com/images/logo/logo3.svg',
              },
            },
          }),
        }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': 'https://nicotinetins.com/#organization',
            name: 'Nicotine Tins by PUXX',
            url: 'https://nicotinetins.com',
            logo: {
              '@type': 'ImageObject',
              url: 'https://nicotinetins.com/images/logo/logo3.svg',
              width: 512,
              height: 512,
            },
            sameAs: [
              'https://twitter.com/nicotinetins',
              'https://www.instagram.com/nicotinetins',
              'https://www.facebook.com/nicotinetins',
            ],
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: '+1-250-415-5678',
                contactType: 'customer service',
                email: 'info@nicotinetins.com',
                areaServed: 'CA',
                availableLanguage: ['English', 'French'],
              },
            ],
          }),
        }}
      />
    </>
  );
}
