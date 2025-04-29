import { ReactNode } from 'react';

export interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
}

// Updated Study interface
export interface Study {
  id: string;
  title: string;
  authors: string; // Component expects string[], might need adjustment in component or data source
  journal: string;
  year: number;
  abstract: string;
  url: string; // Changed from link to url
  category: string;
  keyFindings: string[];
  publicationDate: string; // Added
  doi: string; // Added
}

// Updated Video interface
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  backupThumbnailUrl?: string;
  youtubeUrl: string;
  category: string;
  uploadDate: string; // Added
}
