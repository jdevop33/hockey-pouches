'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// This should match the BRANDING constant in tailwind.config.js
// Set to 'new' for PUXX Premium luxury branding (anzac gold, navy, forest green, cream)
// Set to 'old' for original Hockey Pouches branding (blue, slate, sky)
export type BrandingType = 'new' | 'old';

interface BrandingContextType {
  branding: BrandingType;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    darkBackground: string;
    text: string;
    darkText: string;
  };
}

// Default to new branding
const defaultContext: BrandingContextType = {
  branding: 'new',
  colors: {
    // New branding colors (PUXX Premium)
    primary: 'anzac',
    secondary: 'navy',
    accent: 'forest',
    background: 'cream',
    darkBackground: 'rich',
    text: 'rich',
    darkText: 'cream',
  },
};

const BrandingContext = createContext<BrandingContextType>(defaultContext);

export const useBranding = () => useContext(BrandingContext);

interface BrandingProviderProps {
  children: ReactNode;
  branding?: BrandingType;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({
  children,
  branding = 'new',
}) => {
  const colors = branding === 'new' 
    ? {
        // New branding colors (PUXX Premium)
        primary: 'anzac',
        secondary: 'navy',
        accent: 'forest',
        background: 'cream',
        darkBackground: 'rich',
        text: 'rich',
        darkText: 'cream',
      }
    : {
        // Old branding colors (Hockey Pouches)
        primary: 'primary',
        secondary: 'secondary',
        accent: 'accent',
        background: 'gray',
        darkBackground: 'gray',
        text: 'gray',
        darkText: 'white',
      };

  return (
    <BrandingContext.Provider value={{ branding, colors }}>
      {children}
    </BrandingContext.Provider>
  );
};

export default BrandingProvider;
