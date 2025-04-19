'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const CLARITY_ID = 'r6bz25gfvl';

export default function MicrosoftClarity() {
  useEffect(() => {
    // Skip in development mode
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    // This is a fallback in case the Script component doesn't load
    const clarityScript = document.createElement('script');
    clarityScript.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_ID}");
    `;
    
    // Only add the script if it doesn't already exist
    if (!document.querySelector(`script[src="https://www.clarity.ms/tag/${CLARITY_ID}"]`)) {
      document.head.appendChild(clarityScript);
    }
    
    return () => {
      // Clean up if needed
      if (clarityScript.parentNode) {
        clarityScript.parentNode.removeChild(clarityScript);
      }
    };
  }, []);

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
