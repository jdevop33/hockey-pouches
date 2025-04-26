'use client';

import React, { useState } from 'react';
import Layout from '@/components/layout/NewLayout';
import AccessibleColor from '@/components/ui/AccessibleColor';
import ThemeColors from '@/components/ui/ThemeColors';
import { analyzePalette } from '@/lib/wcag-utils';
import { cn } from '@/lib/utils';

interface PaletteAnalysisResult {
  pairs: Array<{
    fg: string;
    bg: string;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
    passesUIRequirements: boolean;
  }>;
}

export default function ContrastPage() {
  const [paletteAnalysis, setPaletteAnalysis] = useState<PaletteAnalysisResult | null>(null);

  // Gold and dark theme brand colors
  const primaryColors = [
    { name: 'gold-500', hex: '#d4af37' }, // Main gold
    { name: 'gold-600', hex: '#c9a633' }, // Darker gold
    { name: 'gold-700', hex: '#b8860b' }, // Gold alternative
    { name: 'secondary-800', hex: '#1e293b' }, // Main dark blue
    { name: 'secondary-900', hex: '#0f172a' }, // Darker blue
    { name: 'secondary-950', hex: '#05050f' }, // Near black
    { name: 'white', hex: '#FFFFFF' }, // White
  ];

  // Accent colors
  const accentColors = [
    { name: 'accent-500', hex: '#ffd700' }, // Pure gold
    { name: 'accent-400', hex: '#fedf15' }, // Bright gold
    { name: 'accent-600', hex: '#e6c000' }, // Deep gold
    { name: 'success', hex: '#10b981' }, // Green
    { name: 'warning', hex: '#f59e0b' }, // Orange
    { name: 'danger', hex: '#ef4444' }, // Red
    { name: 'info', hex: '#3b82f6' }, // Blue
  ];

  // Analyze the brand palette
  const analyzeThemePalette = () => {
    // Extract just the hex values
    const colors = primaryColors.map(c => c.hex).concat(accentColors.map(c => c.hex));
    const analysis = analyzePalette(colors);
    setPaletteAnalysis(analysis);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gold-500">Design System - Accessibility</h1>
          <p className="mb-4 text-white">
            This page provides tools to analyze and improve the color contrast in our design system.
            Proper contrast is essential for readability and WCAG accessibility compliance.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gold-500">Color Contrast Checker</h2>
            <p className="mb-4 text-white">
              Test any color combination to check if it meets WCAG 2.1 contrast requirements. The
              tool provides instant feedback and suggestions for better color combinations.
            </p>
            <AccessibleColor />
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gold-500">WCAG Guidelines</h2>
            <div className="border-gold-subtle rounded-md border bg-secondary-800 p-4">
              <h3 className="mb-2 text-lg font-medium text-gold-500">
                Color Contrast Requirements
              </h3>
              <p className="mb-4 text-white">
                WCAG 2.1 requires the following minimum contrast ratios:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-white">
                  <thead className="bg-secondary-700">
                    <tr>
                      <th className="p-2 text-left">Element Type</th>
                      <th className="p-2 text-left">Level AA</th>
                      <th className="p-2 text-left">Level AAA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-700">
                    <tr>
                      <td className="p-2">Normal Text (less than 18pt)</td>
                      <td className="p-2">4.5:1</td>
                      <td className="p-2">7:1</td>
                    </tr>
                    <tr>
                      <td className="p-2">Large Text (at least 18pt or 14pt bold)</td>
                      <td className="p-2">3:1</td>
                      <td className="p-2">4.5:1</td>
                    </tr>
                    <tr>
                      <td className="p-2">UI Components & Graphical Objects</td>
                      <td className="p-2">3:1</td>
                      <td className="p-2">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gold-500">Brand Color Palette</h2>
          <p className="mb-4 text-white">
            These are the current brand colors. The contrast ratio shown is against the text color
            used on each swatch.
          </p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ThemeColors title="Primary Brand Colors" swatches={primaryColors} />
            <ThemeColors title="Accent Colors" swatches={accentColors} />
          </div>

          <div className="mt-8">
            <button
              onClick={analyzeThemePalette}
              className="rounded-md bg-gold-500 px-4 py-2 text-secondary-950 transition-colors hover:bg-gold-400"
            >
              Analyze Palette Contrast
            </button>

            {paletteAnalysis && (
              <div className="border-gold-subtle mt-4 rounded-md border bg-secondary-800 p-4">
                <h3 className="mb-2 text-lg font-medium text-gold-500">Palette Analysis</h3>
                <p className="mb-4 text-white">
                  Below are the contrast ratios between color pairs in our palette. For text, we
                  need at least 4.5:1 contrast (for Level AA).
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-white">
                    <thead className="bg-secondary-700">
                      <tr>
                        <th className="p-2 text-left">Foreground</th>
                        <th className="p-2 text-left">Background</th>
                        <th className="p-2 text-left">Ratio</th>
                        <th className="p-2 text-left">AA</th>
                        <th className="p-2 text-left">AAA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-700">
                      {paletteAnalysis.pairs.map((pair, index: number) => (
                        <tr key={index}>
                          <td className="p-2">
                            <div className="flex items-center">
                              <div
                                className={cn(
                                  'mr-2 h-4 w-4 rounded-sm border border-gray-300',
                                  `bg-[${pair.fg}]`
                                )}
                              />
                              {pair.fg}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <div
                                className={cn(
                                  'mr-2 h-4 w-4 rounded-sm border border-gray-300',
                                  `bg-[${pair.bg}]`
                                )}
                              />
                              {pair.bg}
                            </div>
                          </td>
                          <td className="p-2">{pair.ratio.toFixed(2)}:1</td>
                          <td className="p-2">
                            <span
                              className={`rounded px-2 py-0.5 ${pair.passesAA ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                              {pair.passesAA ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                          <td className="p-2">
                            <span
                              className={`rounded px-2 py-0.5 ${pair.passesAAA ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                              {pair.passesAAA ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gold-500">
            Accessible Design Best Practices
          </h2>
          <div className="border-gold-subtle rounded-md border bg-secondary-800 p-4">
            <ul className="list-disc space-y-2 pl-5 text-white">
              <li>Always check text contrast against its background</li>
              <li>
                Use darker gold shades on light backgrounds and lighter gold shades on dark
                backgrounds
              </li>
              <li>
                Don't rely solely on color to convey information - always use additional indicators
              </li>
              <li>Consider users with color blindness when designing UI elements</li>
              <li>Test your designs with accessibility tools to ensure compliance</li>
              <li>
                Provide sufficient contrast for interactive elements like buttons and form controls
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
