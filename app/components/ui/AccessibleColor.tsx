'use client';

import React, { useState, useEffect } from 'react';
import {
  getContrastRatio,
  meetsWcagAA,
  meetsWcagAAA,
  meetsWcagUIRequirements,
  suggestBetterColor,
} from '@/lib/wcag-utils';
import { cn } from '@/lib/utils';

interface AccessibleColorProps {
  defaultForeground?: string;
  defaultBackground?: string;
  showSuggestions?: boolean;
  onContrastChange?: (ratio: number, passes: { aa: boolean; aaa: boolean; ui: boolean }) => void;
}

const AccessibleColor: React.FC<AccessibleColorProps> = ({
  defaultForeground = '#FFFFFF',
  defaultBackground = '#1e293b', // secondary-900
  showSuggestions = true,
  onContrastChange,
}) => {
  const [foreground, setForeground] = useState(defaultForeground);
  const [background, setBackground] = useState(defaultBackground);
  const [contrastRatio, setContrastRatio] = useState(0);
  const [isLargeText, setIsLargeText] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    try {
      const ratio = getContrastRatio(foreground, background);
      setContrastRatio(ratio);

      const passesAA = meetsWcagAA(ratio, isLargeText);
      const passesAAA = meetsWcagAAA(ratio, isLargeText);
      const passesUI = meetsWcagUIRequirements(ratio);

      if (onContrastChange) {
        onContrastChange(ratio, { aa: passesAA, aaa: passesAAA, ui: passesUI });
      }

      // Generate suggestion if needed
      if (showSuggestions && !passesAA) {
        // Determine if background is dark
        const backgroundIsDark = ratio < 1;
        const suggestedColor = suggestBetterColor(foreground, backgroundIsDark);
        setSuggestion(suggestedColor);
      } else {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('Error calculating contrast ratio:', error);
    }
  }, [foreground, background, isLargeText, showSuggestions, onContrastChange]);

  const getContrastLevel = () => {
    if (contrastRatio >= 7) return 'AAA';
    if (contrastRatio >= 4.5) return isLargeText ? 'AAA' : 'AA';
    if (contrastRatio >= 3) return isLargeText ? 'AA' : 'Fail';
    return 'Fail';
  };

  const getContrastClass = () => {
    const level = getContrastLevel();
    switch (level) {
      case 'AAA':
        return 'bg-green-500 text-white';
      case 'AA':
        return 'bg-yellow-500 text-black';
      case 'Fail':
      default:
        return 'bg-red-500 text-white';
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      setForeground(suggestion);
    }
  };

  return (
    <div className="border-gold-subtle space-y-4 rounded-md border bg-secondary-800 p-4">
      <h2 className="text-lg font-semibold text-gold-500">Color Contrast Checker</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="foreground" className="mb-1 block text-sm font-medium text-gold-500">
            Foreground Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="foreground"
              value={foreground}
              onChange={e => setForeground(e.target.value)}
              className="border-gold-subtle h-10 w-10 rounded border p-0"
            />
            <input
              type="text"
              value={foreground}
              onChange={e => setForeground(e.target.value)}
              className="border-gold-subtle w-full rounded-md bg-slate-900 text-white"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <label htmlFor="background" className="mb-1 block text-sm font-medium text-gold-500">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="background"
              value={background}
              onChange={e => setBackground(e.target.value)}
              className="border-gold-subtle h-10 w-10 rounded border p-0"
            />
            <input
              type="text"
              value={background}
              onChange={e => setBackground(e.target.value)}
              className="border-gold-subtle w-full rounded-md bg-slate-900 text-white"
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center space-x-2">
          <input
            type="checkbox"
            checked={isLargeText}
            onChange={e => setIsLargeText(e.target.checked)}
            className="h-4 w-4 rounded text-gold-500 focus:ring-gold-500/20"
          />
          <span className="text-white">Large Text (≥18pt or ≥14pt bold)</span>
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-white">Contrast Ratio:</span>
        <span className="font-bold text-white">{contrastRatio.toFixed(2)}:1</span>
        <span className={`ml-2 rounded px-2 py-1 text-sm font-medium ${getContrastClass()}`}>
          {getContrastLevel()}
        </span>
      </div>

      <div className={cn('rounded-md p-4 text-center', `text-[${foreground}] bg-[${background}]`)}>
        <p className={isLargeText ? 'text-2xl font-bold' : 'text-base'}>
          Sample Text with Selected Colors
        </p>
      </div>

      {suggestion && (
        <div className="rounded-md bg-slate-700 p-3">
          <p className="mb-2 text-white">
            The current color combination doesn't meet WCAG AA standards. Try this suggested
            foreground color instead:
          </p>
          <div className="flex items-center space-x-2">
            <div
              className={cn('h-6 w-6 rounded-md border border-white', `bg-[${suggestion}]`)}
            ></div>
            <span className="text-white">{suggestion}</span>
            <button
              onClick={applySuggestion}
              className="ml-auto rounded-md bg-gold-500 px-3 py-1 text-sm text-secondary-900 hover:bg-gold-400"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium text-gold-500">WCAG 2.1 Requirements:</h3>
        <ul className="space-y-1 text-sm text-white">
          <li>• Normal text: 4.5:1 for AA, 7:1 for AAA</li>
          <li>• Large text: 3:1 for AA, 4.5:1 for AAA</li>
          <li>• UI components: 3:1 minimum</li>
        </ul>
      </div>
    </div>
  );
};

export default AccessibleColor;
