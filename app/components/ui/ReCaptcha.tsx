'use client';

import React, { useEffect, useRef } from 'react';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    // Load the reCAPTCHA script if it's not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        renderReCaptcha();
      };
    } else {
      renderReCaptcha();
    }

    return () => {
      // Reset reCAPTCHA when component unmounts
      if (widgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId.current);
      }
    };
  }, []);

  const renderReCaptcha = () => {
    if (containerRef.current && window.grecaptcha && window.grecaptcha.render) {
      // Use a dummy site key for development - replace with your actual site key in production
      const siteKey =
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

      try {
        // Check if reCAPTCHA has already been rendered in this element
        if (widgetId.current === null) {
          widgetId.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
          });
        } else if (window.grecaptcha.reset) {
          // If already rendered, just reset it
          window.grecaptcha.reset(widgetId.current);
        }
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    } else {
      // If grecaptcha is not available yet, try again after a short delay
      setTimeout(renderReCaptcha, 500);
    }
  };

  return <div ref={containerRef} className="mt-4"></div>;
};

export default ReCaptcha;

// Add type definition for window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement,
        parameters: { sitekey: string; callback: (token: string) => void }
      ) => number;
      reset: (widgetId: number) => void;
      execute: (widgetId: number) => void;
    };
  }
}
