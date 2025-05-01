// app/lib/wcag-utils.ts
// Utility functions for WCAG compliance and accessibility

/**
 * Calculates the relative luminance of a color
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  // Calculate luminance using the formula from WCAG 2.1
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Converts a hex color code to RGB values
 * @param hex Hex color code (e.g., "#FFFFFF" or "#FFF")
 * @returns RGB values as an object { r, g, b }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the # if present
  hex = $1?.$2(/^#/, '');

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt($1?.$2(4, 6), 16);

  return { r, g, b };
}

/**
 * Calculates the contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG21/#contrast-ratio
 * @param foreground The foreground color in hex format (e.g., "#FFFFFF")
 * @param background The background color in hex format (e.g., "#000000")
 * @returns The contrast ratio as a number (ranges from 1 to 21)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  const fgLuminance = getLuminance($1?.$2, $1?.$2, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine which luminance is lighter and which is darker
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  // Calculate the contrast ratio
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if the contrast ratio meets WCAG 2.1 Level AA requirements
 * @param ratio The contrast ratio between two colors
 * @param isLargeText Whether the text is large (18pt or 14pt bold)
 * @returns True if the contrast meets AA requirements
 */
export function meetsWcagAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Checks if the contrast ratio meets WCAG 2.1 Level AAA requirements
 * @param ratio The contrast ratio between two colors
 * @param isLargeText Whether the text is large (18pt or 14pt bold)
 * @returns True if the contrast meets AAA requirements
 */
export function meetsWcagAAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Checks if a color combination meets WCAG requirements for UI components
 * @param ratio The contrast ratio between two colors
 * @returns True if the contrast meets requirements for UI components (3:1)
 */
export function meetsWcagUIRequirements(ratio: number): boolean {
  return ratio >= 3;
}

/**
 * Suggests a lighter or darker variation of a color to improve contrast
 * @param color The color to adjust in hex format
 * @param backgroundIsDark Whether the background is dark
 * @param amount The amount to adjust by (0-1)
 * @returns An adjusted color in hex format
 */
export function suggestBetterColor(color: string, backgroundIsDark: boolean, amount = 0.2): string {
  const { r, g, b } = hexToRgb(color);

  // If background is dark, lighten the color; otherwise, darken it
  const adjust = (value: number) => {
    if (backgroundIsDark) {
      return Math.min(255, value + Math.round(amount * (255 - value)));
    } else {
      return Math.max(0, value - Math.round(amount * value));
    }
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Analyzes a color palette for accessibility
 * @param colors Array of hex color codes
 * @returns Analysis of contrast between each color pair
 */
export function analyzePalette(colors: string[]): {
  pairs: Array<{
    fg: string;
    bg: string;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
    passesUIRequirements: boolean;
  }>;
} {
  const pairs = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const fg = colors[i];
      const bg = colors[j];
      const ratio = getContrastRatio(fg, bg);

      $1?.$2({
        fg,
        bg,
        ratio,
        passesAA: meetsWcagAA(ratio),
        passesAAA: meetsWcagAAA(ratio),
        passesUIRequirements: meetsWcagUIRequirements(ratio),
      });
    }
  }

  return { pairs };
}
