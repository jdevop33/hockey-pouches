'use client';

import React, { useEffect, useRef, memo } from 'react';
import { isDevelopment } from '../../lib/performanceUtils';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

// Memoized component to prevent unnecessary re-renders
const ReCaptcha: React.FC<ReCaptchaProps> = memo(function ReCaptcha({
  onVerify,
  theme = 'light',
  size = 'normal',
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const scriptLoaded = useRef<boolean>(false);
  const renderAttempts = useRef<number>(0);
  const MAX_RENDER_ATTEMPTS = 5;

  // Load reCAPTCHA script once
  useEffect(() => {
    // Skip loading in development mode if needed
    if (isDevelopment() && process.env.NEXT_PUBLIC_SKIP_RECAPTCHA === 'true') {
      return;
    }

    // Load the reCAPTCHA script if it's not already loaded
    if (!window.grecaptcha && !scriptLoaded.current) {
      scriptLoaded.current = true;
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        renderReCaptcha();
      };

      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
        scriptLoaded.current = false;
      };

      document.head.appendChild(script);
    } else if (window.grecaptcha) {
      renderReCaptcha();
    }

    return () => {
      // Reset reCAPTCHA when component unmounts
      if (widgetId.current !== null && window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset(widgetId.current);
        } catch (error) {
          console.error('Error resetting reCAPTCHA:', error);
        }
      }
    };
  }, []);

  const renderReCaptcha = () => {
    if (renderAttempts.current >= MAX_RENDER_ATTEMPTS) {
      console.error('Maximum reCAPTCHA render attempts reached');
      return;
    }

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
            theme,
            size,
          });
        } else if (window.grecaptcha.reset) {
          // If already rendered, just reset it
          window.grecaptcha.reset(widgetId.current);
        }
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
        renderAttempts.current += 1;

        // Try again after a delay with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, renderAttempts.current), 10000);
        setTimeout(renderReCaptcha, delay);
      }
    } else {
      // If grecaptcha is not available yet, try again after a short delay
      renderAttempts.current += 1;
      const delay = Math.min(500 * Math.pow(1.5, renderAttempts.current), 5000);
      setTimeout(renderReCaptcha, delay);
    }
  };

  return <div ref={containerRef} className="recaptcha-container mt-4"></div>;
});

export default ReCaptcha;

// Add type definition for window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
        }
      ) => number;
      reset: (widgetId: number) => void;
      execute: (widgetId: number) => void;
    };
  }
}
