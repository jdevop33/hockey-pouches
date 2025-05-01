'use client';

import { useEffect, useState } from 'react';

import * as schema from '@/lib/schema';
interface Video {
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  uploadDate: string;
}

interface Study {
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  doi: string;
  url: string;
}

interface ResearchStructuredDataProps {
  videos: Video[];
  studies: Study[];
}

export default function ResearchStructuredData({ videos, studies }: ResearchStructuredDataProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeout = setTimeout(() => {
      try {
        setMounted(true);

        // Create structured data for videos
        const videoStructuredData = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: videos.map((video, index) => ({
            '@type': 'VideoObject',
            position: index + 1,
            name: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            uploadDate: video.uploadDate,
            embedUrl: video.youtubeUrl,
          })),
        };

        // Create structured data for studies
        const studyStructuredData = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: studies.map((study, index) => ({
            '@type': 'ScholarlyArticle',
            position: index + 1,
            name: study.title,
            abstract: study.abstract,
            author: study.authors.map(author => ({
              '@type': 'Person',
              name: author,
            })),
            datePublished: study.publicationDate,
            sameAs: study.doi,
            url: study.url,
          })),
        };

        // Add video structured data
        const videoScript = document.createElement('script');
        videoScript.id = 'video-structured-data';
        videoScript.type = 'application/ld+json';
        videoScript.text = JSON.stringify(videoStructuredData);
        document.head.appendChild(videoScript);

        // Add study structured data
        const studyScript = document.createElement('script');
        studyScript.id = 'study-structured-data';
        studyScript.type = 'application/ld+json';
        studyScript.text = JSON.stringify(studyStructuredData);
        document.head.appendChild(studyScript);

        return () => {
          // Clean up scripts on unmount
          const existingVideoScript = document.getElementById('video-structured-data');
          const existingStudyScript = document.getElementById('study-structured-data');
          if (existingVideoScript) document.head.removeChild(existingVideoScript);
          if (existingStudyScript) document.head.removeChild(existingStudyScript);
        };
      } catch (error) {
        console.error('Error setting up structured data:', error);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [videos, studies, mounted]);

  return null;
}
