'use client';

import { useEffect } from 'react';

interface ResearchStructuredDataProps {
  videos: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    youtubeUrl: string;
    category: string;
  }[];
  studies: {
    id: string;
    title: string;
    authors: string;
    journal: string;
    year: number;
    abstract: string;
    link: string;
    category: string;
    keyFindings: string[];
  }[];
}

export default function ResearchStructuredData({ videos, studies }: ResearchStructuredDataProps) {
  useEffect(() => {
    // Create structured data for videos
    const videoStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': videos.map((video, index) => ({
        '@type': 'VideoObject',
        'position': index + 1,
        'name': video.title,
        'description': video.description,
        'thumbnailUrl': video.thumbnailUrl,
        'contentUrl': video.youtubeUrl,
        'uploadDate': '2023-01-01T08:00:00+08:00', // Placeholder date
        'duration': 'PT5M', // Placeholder duration (5 minutes)
        'embedUrl': `https://www.youtube.com/embed/${video.youtubeUrl.split('v=')[1]}`,
        'interactionStatistic': {
          '@type': 'InteractionCounter',
          'interactionType': { '@type': 'WatchAction' },
          'userInteractionCount': 5000 // Placeholder view count
        }
      }))
    };

    // Create structured data for studies
    const studyStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': studies.map((study, index) => ({
        '@type': 'ScholarlyArticle',
        'position': index + 1,
        'headline': study.title,
        'author': {
          '@type': 'Person',
          'name': study.authors.split(',')[0]
        },
        'publisher': {
          '@type': 'Organization',
          'name': study.journal
        },
        'datePublished': `${study.year}`,
        'description': study.abstract,
        'url': study.link
      }))
    };

    // Add structured data to the page
    const videoScript = document.createElement('script');
    videoScript.type = 'application/ld+json';
    videoScript.text = JSON.stringify(videoStructuredData);
    document.head.appendChild(videoScript);

    const studyScript = document.createElement('script');
    studyScript.type = 'application/ld+json';
    studyScript.text = JSON.stringify(studyStructuredData);
    document.head.appendChild(studyScript);

    // Clean up
    return () => {
      document.head.removeChild(videoScript);
      document.head.removeChild(studyScript);
    };
  }, [videos, studies]);

  return null;
}
