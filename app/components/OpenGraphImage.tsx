'use client';

import React, { useEffect, useRef } from 'react';

// This component creates a canvas with the logo and text for OpenGraph images
const OpenGraphImage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions for optimal OG image (1200x630 is recommended)
    canvas.width = 1200;
    canvas.height = 630;

    // Draw background
    ctx.fillStyle = '#0F172A'; // Dark blue background (matches primary color)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw logo
    const logo = new window.Image();
    logo.onload = () => {
      // Calculate logo position (centered, but slightly above center)
      const logoWidth = 400;
      const logoHeight = (logo.height / logo.width) * logoWidth;
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = (canvas.height - logoHeight) / 2 - 50;

      // Draw logo
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

      // Add text below logo
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('Premium Nicotine Pouches', canvas.width / 2, logoY + logoHeight + 80);

      ctx.font = '32px Inter, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('For Hockey Players', canvas.width / 2, logoY + logoHeight + 140);

      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');

      // Save the image (in a real app, you'd use this URL for the OG image)
      const link = document.createElement('a');
      link.download = 'hockey-pouches-og.png';
      link.href = dataUrl;

      // For development purposes, you can uncomment this to download the image
      // link.click();

      // Save to public directory (this won't work in the browser, but the concept is here)
      // In a real scenario, you'd generate this at build time
      try {
        // This is just for demonstration - in a real app, you'd use a server-side approach
        localStorage.setItem('og-image', dataUrl);
      } catch (e) {
        console.error('Could not save OG image to localStorage', e);
      }
    };

    logo.src = '/images/logo/hockey-logo.svg';
  }, []);

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default OpenGraphImage;
