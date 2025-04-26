'use client';

import React, { useState } from 'react';

interface AccessibilityMenuProps {
  className?: string;
}

const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState(100); // percentage
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  // Store settings in localStorage when they change
  const updateSettings = (
    newTextSize?: number,
    newHighContrast?: boolean,
    newReducedMotion?: boolean,
    newDyslexicFont?: boolean
  ) => {
    // Update text size
    if (newTextSize !== undefined && newTextSize !== textSize) {
      setTextSize(newTextSize);
      document.documentElement.style.fontSize = `${newTextSize}%`;
      localStorage.setItem('a11y-text-size', newTextSize.toString());
    }

    // Update high contrast
    if (newHighContrast !== undefined && newHighContrast !== highContrast) {
      setHighContrast(newHighContrast);
      if (newHighContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      localStorage.setItem('a11y-high-contrast', newHighContrast.toString());
    }

    // Update reduced motion
    if (newReducedMotion !== undefined && newReducedMotion !== reducedMotion) {
      setReducedMotion(newReducedMotion);
      if (newReducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      localStorage.setItem('a11y-reduced-motion', newReducedMotion.toString());
    }

    // Update dyslexic font
    if (newDyslexicFont !== undefined && newDyslexicFont !== dyslexicFont) {
      setDyslexicFont(newDyslexicFont);
      if (newDyslexicFont) {
        document.documentElement.classList.add('dyslexic-font');
      } else {
        document.documentElement.classList.remove('dyslexic-font');
      }
      localStorage.setItem('a11y-dyslexic-font', newDyslexicFont.toString());
    }
  };

  // Initialize settings from localStorage on first render
  React.useEffect(() => {
    // Text size
    const savedTextSize = localStorage.getItem('a11y-text-size');
    if (savedTextSize) {
      const size = parseInt(savedTextSize, 10);
      setTextSize(size);
      document.documentElement.style.fontSize = `${size}%`;
    }

    // High contrast
    const savedHighContrast = localStorage.getItem('a11y-high-contrast');
    if (savedHighContrast === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    // Reduced motion
    const savedReducedMotion = localStorage.getItem('a11y-reduced-motion');
    if (savedReducedMotion === 'true') {
      setReducedMotion(true);
      document.documentElement.classList.add('reduced-motion');
    }

    // Dyslexic font
    const savedDyslexicFont = localStorage.getItem('a11y-dyslexic-font');
    if (savedDyslexicFont === 'true') {
      setDyslexicFont(true);
      document.documentElement.classList.add('dyslexic-font');
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const increaseTextSize = () => {
    const newSize = Math.min(textSize + 10, 150); // Max 150%
    updateSettings(newSize, undefined, undefined, undefined);
  };

  const decreaseTextSize = () => {
    const newSize = Math.max(textSize - 10, 80); // Min 80%
    updateSettings(newSize, undefined, undefined, undefined);
  };

  const resetTextSize = () => {
    updateSettings(100, undefined, undefined, undefined);
  };

  const toggleHighContrast = () => {
    updateSettings(undefined, !highContrast, undefined, undefined);
  };

  const toggleReducedMotion = () => {
    updateSettings(undefined, undefined, !reducedMotion, undefined);
  };

  const toggleDyslexicFont = () => {
    updateSettings(undefined, undefined, undefined, !dyslexicFont);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleMenu}
        className="border-gold-subtle flex h-10 w-10 items-center justify-center rounded-full border bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        aria-label="Accessibility options"
        aria-expanded="false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gold-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h2.5A1.5 1.5 0 0117 11.5v5A1.5 1.5 0 0115.5 18H14m0-8v8m-4-8v8m0 0h2.5A1.5 1.5 0 0114 16.5v-5A1.5 1.5 0 0012.5 10H10m-4 8h-.5A1.5 1.5 0 014 16.5v-5A1.5 1.5 0 015.5 10H6m8 0a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-gold-subtle absolute right-0 z-50 mt-2 w-64 rounded-md border bg-secondary-800 shadow-lg">
          <div className="p-3">
            <h3 className="mb-2 text-sm font-semibold text-gold-500">Accessibility Options</h3>

            <div className="space-y-3">
              {/* Text Size Controls */}
              <div>
                <p className="mb-1 text-xs font-medium text-gray-300">Text Size ({textSize}%)</p>
                <div className="flex space-x-2">
                  <button
                    onClick={decreaseTextSize}
                    className="rounded bg-secondary-700 px-2 py-1 text-xs text-white hover:bg-secondary-600"
                    aria-label="Decrease text size"
                  >
                    A-
                  </button>
                  <button
                    onClick={resetTextSize}
                    className="rounded bg-secondary-700 px-2 py-1 text-xs text-white hover:bg-secondary-600"
                    aria-label="Reset text size"
                  >
                    Reset
                  </button>
                  <button
                    onClick={increaseTextSize}
                    className="rounded bg-secondary-700 px-2 py-1 text-xs text-white hover:bg-secondary-600"
                    aria-label="Increase text size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* High Contrast Toggle */}
              <div>
                <label className="flex cursor-pointer items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={highContrast}
                      onChange={toggleHighContrast}
                    />
                    <div className="h-5 w-10 rounded-full bg-secondary-700 shadow-inner"></div>
                    <div
                      className={`${
                        highContrast ? 'translate-x-5 bg-gold-500' : 'translate-x-0 bg-gray-400'
                      } absolute left-0 top-0 h-5 w-5 rounded-full transition-transform duration-200`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-white">High Contrast</span>
                </label>
              </div>

              {/* Reduced Motion Toggle */}
              <div>
                <label className="flex cursor-pointer items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={reducedMotion}
                      onChange={toggleReducedMotion}
                    />
                    <div className="h-5 w-10 rounded-full bg-secondary-700 shadow-inner"></div>
                    <div
                      className={`${
                        reducedMotion ? 'translate-x-5 bg-gold-500' : 'translate-x-0 bg-gray-400'
                      } absolute left-0 top-0 h-5 w-5 rounded-full transition-transform duration-200`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-white">Reduced Motion</span>
                </label>
              </div>

              {/* Dyslexic Font Toggle */}
              <div>
                <label className="flex cursor-pointer items-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={dyslexicFont}
                      onChange={toggleDyslexicFont}
                    />
                    <div className="h-5 w-10 rounded-full bg-secondary-700 shadow-inner"></div>
                    <div
                      className={`${
                        dyslexicFont ? 'translate-x-5 bg-gold-500' : 'translate-x-0 bg-gray-400'
                      } absolute left-0 top-0 h-5 w-5 rounded-full transition-transform duration-200`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-white">Dyslexia-friendly Font</span>
                </label>
              </div>
            </div>

            <div className="mt-3 border-t border-secondary-700 pt-2">
              <a
                href="/design/contrast"
                className="text-xs text-gold-500 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View Accessibility Design System
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityMenu;
