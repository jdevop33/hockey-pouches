import { ReactNode } from 'react';

export interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface Study {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  link: string;
  category: string;
  keyFindings: string[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  backupThumbnailUrl?: string;
  youtubeUrl: string;
  category: string;
}
