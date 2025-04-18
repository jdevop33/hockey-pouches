/**
 * Utility functions for image optimization
 */

/**
 * Generate responsive image sizes for different viewports
 * @param baseSize Base size in pixels
 * @returns String of sizes for use in the sizes attribute
 */
export const getResponsiveSizes = (baseSize: number): string => {
  return `
    (max-width: 640px) ${Math.min(baseSize, 640)}px,
    (max-width: 768px) ${Math.min(baseSize, 768)}px,
    (max-width: 1024px) ${Math.min(baseSize, 1024)}px,
    (max-width: 1280px) ${Math.min(baseSize, 1280)}px,
    ${baseSize}px
  `.trim();
};

/**
 * Generate srcSet for responsive images
 * @param src Base image source
 * @param widths Array of widths to generate
 * @returns Array of image URLs with width descriptors
 */
export const generateSrcSet = (src: string, widths: number[]): string => {
  if (src.startsWith('http') || src.startsWith('https')) {
    // For external images, we can't generate srcSet
    return '';
  }
  
  // For local images, generate srcSet
  return widths
    .map(width => {
      const url = new URL(src, 'http://localhost');
      url.searchParams.set('w', width.toString());
      return `${url.pathname}${url.search} ${width}w`;
    })
    .join(', ');
};

/**
 * Get image dimensions for proper aspect ratio
 * @param src Image source
 * @param defaultWidth Default width if dimensions can't be determined
 * @param defaultHeight Default height if dimensions can't be determined
 * @returns Object with width and height
 */
export const getImageDimensions = (
  src: string,
  defaultWidth = 640,
  defaultHeight = 640
): { width: number; height: number } => {
  // This is a placeholder - in a real app, you would use an image processing
  // library to get the actual dimensions of the image
  return {
    width: defaultWidth,
    height: defaultHeight,
  };
};

/**
 * Extract YouTube video ID from URL
 * @param url YouTube URL
 * @returns YouTube video ID or null if invalid
 */
export const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Get YouTube thumbnail URL from video ID
 * @param videoId YouTube video ID
 * @returns URL to the thumbnail image
 */
export const getYoutubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
};

/**
 * Calculate aspect ratio padding for responsive containers
 * @param width Width of the image
 * @param height Height of the image
 * @returns Padding-bottom percentage for maintaining aspect ratio
 */
export const calculateAspectRatioPadding = (width: number, height: number): string => {
  return `${(height / width) * 100}%`;
};
