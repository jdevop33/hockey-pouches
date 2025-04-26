'use client';

import { useState, useEffect } from 'react';
import { getYoutubeId, getYoutubeThumbnail } from '../../lib/utils';

// Array of thumbnail quality options to try
const thumbnailQualities = ['maxres', 'high', 'medium', 'default'] as const;

interface VideoThumbnailProps {
  youtubeUrl: string;
  title: string;
  thumbnailUrl?: string;
  backupThumbnailUrl?: string;
  videoId?: string;
  className?: string;
}

export default function VideoThumbnail({
  youtubeUrl,
  title,
  thumbnailUrl,
  backupThumbnailUrl,
  videoId: providedVideoId,
  className = '',
}: VideoThumbnailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Get the video ID from the URL if not provided
  const videoId = providedVideoId || getYoutubeId(youtubeUrl);

  useEffect(() => {
    if (!videoId) {
      // If no valid YouTube ID, use provided thumbnail or default
      setImageSrc(thumbnailUrl || backupThumbnailUrl || '/images/videos/default-video-thumb.jpg');
      return;
    }

    // If a custom thumbnail is provided, use that first
    if (thumbnailUrl) {
      setImageSrc(thumbnailUrl);
      return;
    }

    // Otherwise, use the YouTube thumbnail with current quality
    const quality = thumbnailQualities[fallbackIndex];
    // Use 'default' as a fallback if the quality isn't supported
    setImageSrc(getYoutubeThumbnail(videoId, quality || 'default'));
  }, [youtubeUrl, thumbnailUrl, backupThumbnailUrl, fallbackIndex, videoId]);

  const handleImageError = () => {
    // If we have a backup thumbnail provided and the main one failed, use it
    if (thumbnailUrl && backupThumbnailUrl && fallbackIndex === 0) {
      setImageSrc(backupThumbnailUrl);
      setFallbackIndex(1); // Move to next fallback stage
      return;
    }

    // Otherwise try the next YouTube quality level
    if (fallbackIndex < thumbnailQualities.length - 1) {
      setFallbackIndex(fallbackIndex + 1);
    } else {
      // If all options fail, use default image
      setImageSrc('/images/videos/default-video-thumb.jpg');
      setImageLoaded(true);
    }
  };

  // Custom click handler that dispatches a custom event
  const handleClick = () => {
    if (videoId) {
      const event = new CustomEvent('play-video', {
        bubbles: true,
        detail: { videoId },
      });
      document.dispatchEvent(event);
    }
  };

  return (
    <div
      className={`aspect-video relative overflow-hidden rounded-lg ${className}`}
      onClick={handleClick}
    >
      {/* Loading skeleton */}
      {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-dark-600"></div>}

      {/* Thumbnail Image */}
      {imageSrc && (
        <div className="relative h-full w-full">
          <img
            src={imageSrc}
            alt={`Thumbnail for ${title}`}
            className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/80 text-dark-900 transition-transform duration-300 hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
