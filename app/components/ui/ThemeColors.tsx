'use client';

import React from 'react';
import { getContrastRatio, meetsWcagAA } from '@/lib/wcag-utils';
import { cn } from '@/lib/utils';

interface ColorSwatch {
  name: string;
  hex: string;
  textColor?: string;
}

interface ThemeColorsProps {
  title?: string;
  swatches?: ColorSwatch[];
  showContrast?: boolean;
}

const defaultSwatches: ColorSwatch[] = [
  // Primary (Gold) colors
  { name: 'primary-500', hex: '#d4af37' },
  { name: 'primary-600', hex: '#b8860b' },
  { name: 'primary-700', hex: '#a17808' },

  // Secondary (Dark Blues) colors
  { name: 'secondary-700', hex: '#334155' },
  { name: 'secondary-800', hex: '#1e293b' },
  { name: 'secondary-900', hex: '#0f172a' },
  { name: 'secondary-950', hex: '#05050f' },

  // Accent (Gold) colors
  { name: 'accent-400', hex: '#fedf15' },
  { name: 'accent-500', hex: '#ffd700' },
  { name: 'accent-600', hex: '#e6c000' },

  // Gold colors
  { name: 'gold-400', hex: '#d9bc47' },
  { name: 'gold-500', hex: '#d4af37' },
  { name: 'gold-600', hex: '#c9a633' },
  { name: 'gold-700', hex: '#b8860b' },
];

const ThemeColors: React.FC<ThemeColorsProps> = ({
  title = 'Current Theme Colors',
  swatches = defaultSwatches,
  showContrast = true,
}) => {
  // Determine the best text color for a given background
  const getTextColor = (bgColor: string): string => {
    // Default text colors for testing contrast
    const lightText = '#FFFFFF';
    const darkText = '#000000';

    // Check contrast for light text
    const lightContrast = getContrastRatio(lightText, bgColor);
    const darkContrast = getContrastRatio(darkText, bgColor);

    // Choose the text color with better contrast
    return lightContrast > darkContrast ? lightText : darkText;
  };

  // Prepare swatches with text colors if not provided
  const preparedSwatches = swatches.map(swatch => ({
    ...swatch,
    textColor: swatch.textColor || getTextColor(swatch.hex),
  }));

  return (
    <div className="border-gold-subtle rounded-md border bg-secondary-800 p-4">
      <h2 className="mb-4 text-lg font-semibold text-gold-500">{title}</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {preparedSwatches.map(swatch => {
          const textColor = swatch.textColor;
          const contrastRatio = getContrastRatio(textColor, swatch.hex);
          const passesAA = meetsWcagAA(contrastRatio);

          return (
            <div key={swatch.name} className="space-y-1">
              <div
                className={cn(
                  'flex h-20 items-center justify-center overflow-hidden rounded-md border border-gray-200 shadow-sm',
                  `bg-[${swatch.hex}]`
                )}
              >
                <span
                  className={cn(
                    'rounded px-2 py-1 font-medium',
                    `text-[${textColor}]`,
                    textColor === '#FFFFFF' ? 'bg-black/20' : 'bg-white/20'
                  )}
                >
                  {swatch.name}
                </span>
              </div>

              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-200">{swatch.hex}</span>
                  {showContrast && (
                    <span
                      className={`rounded px-1 ${passesAA ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {contrastRatio.toFixed(1)}:1
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showContrast && (
        <p className="mt-4 text-xs text-gray-300">
          *Contrast ratios shown are between the background color and the text displayed on it. WCAG
          AA requires a minimum of 4.5:1 for normal text.
        </p>
      )}
    </div>
  );
};

export default ThemeColors;
