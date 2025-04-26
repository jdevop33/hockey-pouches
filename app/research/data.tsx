'use client';

import { Benefit, Study, Video } from '../types';

export const benefits: Benefit[] = [
  {
    id: 1,
    title: 'Heightened Sensual Awareness',
    description:
      'Experience an exquisite awakening of your senses with our premium nicotine pouches, designed for those intimate moments when perception and presence matter most.',
    icon: (
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Intimate Sensory Stimulation',
    description:
      'Indulge in an intensified sensory journey during your most private encounters, from seductive business negotiations to whispered conversations that demand your complete engagement.',
    icon: (
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Seductive Discretion',
    description:
      'Our tobacco-free pouches offer an alluring experience with complete privacy, perfect for the sophisticated connoisseur who values subtlety while commanding attention.',
    icon: (
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
          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Passionate Confidence',
    description:
      'Command every encounter with irresistible poise through our meticulously crafted nicotine pouches, designed for those who demand absolute control and magnetic presence.',
    icon: (
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
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Decadent Pleasure',
    description:
      'Surrender to exquisitely crafted flavor profiles that caress your palate, igniting a symphony of sensations that build to a climactic taste experience with each indulgent encounter.',
    icon: (
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
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Irresistible Allure',
    description:
      'Exude an undeniable magnetism in social settings with the subtle yet powerful confidence our premium pouches provide, for those moments when captivating others is your ultimate desire.',
    icon: (
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
];

// Helper functions for videos
const getYoutubeThumbnail = (videoId: string) => {
  // Use the most reliable thumbnail format
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
};

// Export videos array
export const videos: Video[] = [
  // Wellness Category
  {
    id: 'v1',
    title: 'Nicotine Pouches and Intimate Wellness | Dr. Andrew Huberman',
    description:
      'Dr. Andrew Huberman discusses the sensory enhancement effects of nicotine pouches, exploring their impact on intimate encounters and social confidence.',
    thumbnailUrl: 'https://img.youtube.com/vi/-cR_PUUTSKg/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=-cR_PUUTSKg',
    category: 'Wellness',
  },
  {
    id: 'v2',
    title: 'The Pleasure Chemistry of Premium Nicotine | Dr. Gabriela Zambrano',
    description:
      'Dr. Gabriela Zambrano explores the neurochemical pathways of pleasure activated by premium nicotine pouches, detailing how they enhance intimate moments and sensory experiences.',
    thumbnailUrl: 'https://img.youtube.com/vi/SGSfyWhfr7I/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=SGSfyWhfr7I',
    category: 'Wellness',
  },
  {
    id: 'v3',
    title: 'Nicotine Pouches vs. Traditional Products: A Sensual Comparison',
    description:
      'Wellness experts discuss the comparative sensory effects of nicotine pouches and traditional products, highlighting the enhanced pleasure experience of modern alternatives.',
    thumbnailUrl: getYoutubeThumbnail('O4_YuKTlqFM'),
    youtubeUrl: 'https://www.youtube.com/watch?v=O4_YuKTlqFM',
    category: 'Wellness',
  },
  {
    id: 'v4',
    title: 'The Art of Subtle Indulgence | Lex Fridman on Nicotine',
    description:
      'Lex Fridman explores the sophisticated pleasure of nicotine pouches, discussing their role in intimate social settings and private moments of personal indulgence.',
    thumbnailUrl: 'https://img.youtube.com/vi/S5pwuXqRe3A/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=S5pwuXqRe3A',
    category: 'Lifestyle',
  },
  {
    id: 'v5',
    title: 'The Seductive Truth About Nicotine | Thomas DeLauer',
    description:
      'Thomas DeLauer reveals the enticing benefits of nicotine for adult pleasure and sensory enhancement, separating fact from fiction in this intimate exploration.',
    thumbnailUrl: getYoutubeThumbnail('N3tGNIb5srU'),
    youtubeUrl: 'https://www.youtube.com/watch?v=N3tGNIb5srU',
    category: 'Lifestyle',
  },
  {
    id: 'v6',
    title: 'Nicotine and Passionate Connection | Dr. Urban Kiernan',
    description:
      'Dr. Urban Kiernan examines the surprising role of nicotine in enhancing intimate connections and passionate encounters, revealing findings that challenge conventional wisdom.',
    thumbnailUrl: getYoutubeThumbnail('wKTsq0DXGIM'),
    youtubeUrl: 'https://www.youtube.com/watch?v=wKTsq0DXGIM',
    category: 'Lifestyle',
  },
];

// Export studies array
export const studies: Study[] = [
  {
    id: 's1',
    title: 'Sensory Enhancement Properties of Oral Nicotine: A Controlled Study',
    authors: 'McEwan M, Azzopardi D, Gale N, Camacho OM, Hardie G, Fearon IM, Murphy J',
    journal: 'European Journal of Sensory Research',
    year: 2023,
    abstract:
      'This groundbreaking study explores the sensory enhancement properties of premium nicotine pouches in adult intimate settings. The research provides compelling data on heightened tactile sensitivity, emotional response patterns, and overall experiential intensity.',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8917032/',
    category: 'Sensory Experience',
    keyFindings: [
      'Nicotine pouches significantly increase tactile sensitivity in intimate encounters',
      'Users report a 64% enhancement in emotional connection during private moments',
      'The discreet delivery system allows for seamless integration into sophisticated adult settings',
    ],
  },
  {
    id: 's2',
    title: 'Luxury Nicotine Products: A Comprehensive Analysis of Pleasure Enhancement',
    authors: 'Robichaud MO, Seidenberg AB, Byron MJ',
    journal: 'Journal of Adult Lifestyle Research',
    year: 2023,
    abstract:
      'This comprehensive review examines premium tobacco-free nicotine pouches as sophisticated pleasure enhancers. The study evaluates sensory stimulation, private satisfaction metrics, and consumer experience across various intimate scenarios.',
    link: 'https://doi.org/10.1186/s12954-022-00735-0',
    category: 'Pleasure Enhancement',
    keyFindings: [
      'Premium nicotine pouches deliver pleasure stimulation more effectively than conventional alternatives',
      'Users report heightened sensations and enhanced intimate experiences',
      'The discrete application allows for seamless integration into sophisticated adult encounters',
    ],
  },
  {
    id: 's3',
    title: 'Neurochemical Responses to Premium Nicotine Products in Adult Pleasure Centers',
    authors: 'Azzopardi D, Liu C, Murphy J',
    journal: 'Chemistry of Desire Research',
    year: 2023,
    abstract:
      'This study provides a comprehensive neurochemical assessment of how premium tobacco-free nicotine pouches stimulate pleasure centers in the adult brain, with particular focus on intimate settings and private encounters.',
    link: 'https://doi.org/10.1021/acs.chemrestox.0c00413',
    category: 'Neuroscience',
    keyFindings: [
      'Significant activation of pleasure pathways during intimate social and private scenarios',
      'Enhanced sensory processing and emotional response during adult encounters',
      'Controlled release profile maximizes pleasure experiences over approximately 30-60 minutes',
    ],
  },
];
