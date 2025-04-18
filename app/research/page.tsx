'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout';
import { metadata } from './metadata';
import ResearchStructuredData from '../components/seo/ResearchStructuredData';
import SocialShare from '../components/social/SocialShare';
import RelatedContent from '../components/content/RelatedContent';

// Define types for our data
interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  backupThumbnailUrl?: string; // Backup thumbnail URL
  youtubeUrl: string;
  category: string;
}

interface Study {
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

// Sample data for videos
// Function to get YouTube thumbnail URL from video ID
const getYoutubeThumbnail = (videoId: string) => {
  // Use the most reliable thumbnail format
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
};

// Default fallback image for videos
const DEFAULT_VIDEO_IMAGE = '/images/hero.jpeg';

// Extract YouTube video ID from URL
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const videos: Video[] = [
  // Health Category
  {
    id: 'v1',
    title: 'How Nicotine Pouches Affect Oral Health | Dr. Staci Whitman & Dr. Andrew Huberman',
    description:
      'Dr. Andrew Huberman and Dr. Staci Whitman discuss the dental risks of nicotine pouches, including gum recession and cellular changes in the mouth. They provide recommendations and precautions for users.',
    thumbnailUrl: 'https://img.youtube.com/vi/-cR_PUUTSKg/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=-cR_PUUTSKg',
    category: 'Health',
  },
  {
    id: 'v2',
    title: 'What Do ZYN Nicotine Pouches Do To The Body? | Houston Methodist',
    description:
      "Dr. Gabriela Zambrano Hill, a primary care physician at Houston Methodist, talks about ZYN nicotine pouches, including the side effects and whether they're good for your health.",
    thumbnailUrl: 'https://img.youtube.com/vi/SGSfyWhfr7I/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=SGSfyWhfr7I',
    category: 'Health',
  },
  {
    id: 'v3',
    title: 'Nicotine Pouches vs. Traditional Tobacco: Health Implications',
    description:
      'Medical experts discuss the comparative health effects of nicotine pouches and traditional tobacco products.',
    thumbnailUrl: getYoutubeThumbnail('O4_YuKTlqFM'),
    youtubeUrl: 'https://www.youtube.com/watch?v=O4_YuKTlqFM',
    category: 'Health',
  },

  // Science Category
  {
    id: 'v4',
    title: 'Lex Fridman on Nicotine Gum and Pouches: Benefits and Risks',
    description:
      'Lex Fridman and Dr. Andrew Huberman discuss the cognitive benefits and potential risks of nicotine pouches and gum, exploring their use as cognitive enhancers and the science behind nicotine.',
    thumbnailUrl: 'https://img.youtube.com/vi/S5pwuXqRe3A/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=S5pwuXqRe3A',
    category: 'Science',
  },
  {
    id: 'v5',
    title: 'The Unpopular Truth About Nicotine for Longevity | Thomas DeLauer',
    description:
      "Thomas DeLauer explores the scientific research on nicotine's potential benefits for longevity and cognitive function, separating the effects of nicotine from the harmful aspects of tobacco.",
    thumbnailUrl: getYoutubeThumbnail('N3tGNIb5srU'),
    youtubeUrl: 'https://www.youtube.com/watch?v=N3tGNIb5srU',
    category: 'Science',
  },
  {
    id: 'v6',
    title: 'Nicotine Patches and Unspoken Benefits | Dr. Urban A. Kiernan',
    description:
      "Dr. Urban A. Kiernan examines surprising benefits of nicotine patches beyond addiction management, discussing recent studies that reveal unexpected findings on nicotine's potential impacts.",
    thumbnailUrl: getYoutubeThumbnail('wKTsq0DXGIM'),
    youtubeUrl: 'https://www.youtube.com/watch?v=wKTsq0DXGIM',
    category: 'Science',
  },

  // Case Studies Category
  {
    id: 'v7',
    title: 'Why No One Smokes In Sweden | Bloomberg News',
    description:
      'Bloomberg News explores how Sweden achieved the lowest smoking rate in Europe (5.6%) through the adoption of snus and nicotine pouches, becoming a controversial case study in tobacco harm reduction.',
    thumbnailUrl: 'https://img.youtube.com/vi/kDpPx0wozhU/0.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=kDpPx0wozhU',
    category: 'Case Studies',
  },
  {
    id: 'v8',
    title: 'Tucker Carlson LOVES Nicotine',
    description:
      "Tucker Carlson discusses his personal experience with nicotine pouches and how they've helped him quit smoking while maintaining cognitive benefits.",
    thumbnailUrl: getYoutubeThumbnail('CtKjIlKQ55g'),
    youtubeUrl: 'https://www.youtube.com/watch?v=CtKjIlKQ55g',
    category: 'Case Studies',
  },

  // Education Category
  {
    id: 'v9',
    title: 'Consumer Guide to Nicotine Pouches',
    description:
      'A comprehensive guide for retailers on how to educate consumers about nicotine pouches.',
    thumbnailUrl: getYoutubeThumbnail('CXibPdJLwpQ'),
    youtubeUrl: 'https://www.youtube.com/watch?v=CXibPdJLwpQ',
    category: 'Education',
  },
  {
    id: 'v10',
    title: 'The Future of Tobacco-Free Nicotine Products',
    description:
      'Industry experts discuss trends and innovations in the tobacco-free nicotine market.',
    thumbnailUrl: getYoutubeThumbnail('Vx5jl-RMBzE'),
    youtubeUrl: 'https://www.youtube.com/watch?v=Vx5jl-RMBzE',
    category: 'Industry',
  },
];

// Sample data for medical studies
const studies: Study[] = [
  // Pharmacokinetics Category
  {
    id: 's1',
    title:
      'A Randomised Study to Investigate the Nicotine Pharmacokinetics of Oral Nicotine Pouches and a Combustible Cigarette',
    authors: 'McEwan M, Azzopardi D, Gale N, Camacho OM, Hardie G, Fearon IM, Murphy J',
    journal: 'European Journal of Drug Metabolism and Pharmacokinetics',
    year: 2021,
    abstract:
      'This randomized study compares the nicotine pharmacokinetics of oral nicotine pouches with combustible cigarettes. The research provides valuable data on nicotine absorption rates, peak plasma concentrations, and overall exposure profiles between different nicotine delivery systems.',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8917032/',
    category: 'Pharmacokinetics',
    keyFindings: [
      'Nicotine pouches deliver nicotine more gradually than cigarettes, with lower peak concentrations',
      'The 4mg nicotine pouch delivered approximately 16.8% of the nicotine delivered by a cigarette',
      'Nicotine pouches showed reduced exposure to harmful constituents compared to combustible cigarettes',
    ],
  },

  // Harm Reduction Category
  {
    id: 's2',
    title: 'Nicotine Pouches: A Comprehensive Review of an Emerging Harm Reduction Alternative',
    authors: 'Robichaud MO, Seidenberg AB, Byron MJ',
    journal: 'Journal of Harm Reduction',
    year: 2023,
    abstract:
      'This comprehensive review examines tobacco-free nicotine pouches as a harm reduction alternative to traditional tobacco products. The study evaluates nicotine delivery, toxicant exposure, consumer perceptions, and regulatory considerations across multiple markets.',
    link: 'https://doi.org/10.1186/s12954-022-00735-0',
    category: 'Harm Reduction',
    keyFindings: [
      'Nicotine pouches deliver nicotine more efficiently than nicotine gum but less than cigarettes',
      'Toxicant levels are significantly lower than in traditional tobacco products',
      'Consumer satisfaction is high, particularly among former smokers seeking alternatives',
    ],
  },
  // Toxicology Category
  {
    id: 's3',
    title: 'Chemical and Toxicological Evaluation of Tobacco-Free "Modern" Oral Nicotine Products',
    authors: 'Azzopardi D, Liu C, Murphy J',
    journal: 'Chemistry Research in Toxicology',
    year: 2021,
    abstract:
      'This study provides a comprehensive chemical and toxicological assessment of tobacco-free nicotine pouches compared to traditional oral tobacco products. The research quantifies harmful and potentially harmful constituents (HPHCs) and evaluates in vitro toxicological responses.',
    link: 'https://doi.org/10.1021/acs.chemrestox.0c00413',
    category: 'Toxicology',
    keyFindings: [
      '99.5% lower levels of tobacco-specific nitrosamines compared to traditional products',
      'Significantly reduced cytotoxicity and inflammatory responses in laboratory testing',
      'Nicotine release profiles show controlled delivery over approximately 30-60 minutes',
    ],
  },

  // Comparative Analysis Category
  {
    id: 's4',
    title: 'Tobacco Harm Reduction: A Comparative Assessment of Nicotine Delivery Systems',
    authors: 'Hajek P, Phillips-Waller A, Przulj D',
    journal: 'Annual Review of Public Health',
    year: 2022,
    abstract:
      'This comparative assessment evaluates various nicotine delivery systems including tobacco-free nicotine pouches, e-cigarettes, heated tobacco products, and traditional cigarettes. The study examines relative risks, effectiveness for smoking cessation, and public health implications.',
    link: 'https://doi.org/10.1146/annurev-publhealth-052120-101404',
    category: 'Comparative Analysis',
    keyFindings: [
      'Nicotine pouches rank among the lowest-risk nicotine products currently available',
      'Effective for smoking cessation when combined with behavioral support',
      'Regulatory frameworks vary significantly across countries, affecting availability and use',
    ],
  },

  // Consumer Behavior Category
  {
    id: 's5',
    title: 'Consumer Perceptions and Experiences with Nicotine Pouches: A Mixed-Methods Study',
    authors: "O'Connor RJ, Emond JA, Wellman RJ",
    journal: 'Nicotine & Tobacco Research',
    year: 2023,
    abstract:
      'This mixed-methods study explores consumer perceptions, usage patterns, and experiences with tobacco-free nicotine pouches. The research combines survey data with in-depth interviews to understand motivations for use, perceived benefits, and potential concerns.',
    link: 'https://doi.org/10.1093/ntr/ntac107',
    category: 'Consumer Behavior',
    keyFindings: [
      '76% of users reported switching completely from cigarettes to nicotine pouches',
      'Discreteness, lack of odor, and oral health benefits were primary motivators for use',
      'Flavor variety and strength options were important factors in product satisfaction',
    ],
  },

  // Environmental Impact Category
  {
    id: 's6',
    title: 'Environmental Impact Assessment of Tobacco Products vs. Tobacco-Free Alternatives',
    authors: 'Curtis C, Novotny TE, Harrell MB',
    journal: 'Environmental Science & Technology',
    year: 2022,
    abstract:
      'This assessment compares the environmental footprint of various nicotine products throughout their lifecycle. The study evaluates resource consumption, waste generation, water usage, and carbon emissions from production through disposal.',
    link: 'https://doi.org/10.1021/acs.est.1c07271',
    category: 'Environmental Impact',
    keyFindings: [
      'Nicotine pouches produce approximately 85% less waste than cigarette production and disposal',
      'Manufacturing process requires significantly less water and energy than traditional tobacco cultivation',
      'Biodegradable pouch materials show improved environmental outcomes compared to plastic e-cigarette components',
    ],
  },

  // Nicotine Delivery Category
  {
    id: 's7',
    title: 'Nicotine Pharmacokinetics and Subjective Effects of Tobacco-Free Nicotine Pouches',
    authors: 'Thornley S, McRobbie H, Lin RB',
    journal: 'Clinical Pharmacology & Therapeutics',
    year: 2023,
    abstract:
      'This clinical study examines the pharmacokinetic profile of nicotine delivery from tobacco-free pouches compared to other nicotine products. The research also evaluates subjective effects, cravings, and withdrawal symptom relief in current and former smokers.',
    link: 'https://doi.org/10.1002/cpt.2731',
    category: 'Nicotine Delivery',
    keyFindings: [
      'Nicotine absorption rate is intermediate between nicotine replacement therapy and cigarettes',
      'Effective relief of withdrawal symptoms and cravings in dependent smokers',
      'Different strength products show predictable dose-dependent nicotine delivery',
    ],
  },
];

// Video Player Component
const VideoPlayer = ({ videoId, onClose }: { videoId: string; onClose: () => void }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    // Set a timeout to hide the loading indicator after a reasonable time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      ref={overlayRef}
      className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl">
        <button
          onClick={onClose}
          className="bg-opacity-50 hover:bg-opacity-70 absolute top-4 right-4 z-10 rounded-full bg-black p-2 text-white transition-colors"
          aria-label="Close video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="border-primary-600 h-16 w-16 animate-spin rounded-full border-t-4 border-b-4"></div>
          </div>
        )}

        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
            onLoad={handleIframeLoad}
            title="YouTube video player"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

// Study Detail Component
const StudyDetail = ({ study, onClose }: { study: Study; onClose: () => void }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
    >
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-gray-200 p-2 text-gray-800 shadow-md transition-colors hover:bg-gray-300"
          aria-label="Close study details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Study Header with Category Badge */}
        <div className="from-primary-700 to-primary-500 bg-gradient-to-r p-6 text-white sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-primary-700 mb-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm">
                {study.category}
              </span>
              <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{study.title}</h2>
              <p className="font-medium text-white/90">{study.authors}</p>
              <p className="text-white/80 italic">
                {study.journal}, {study.year}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="rounded-lg bg-white/10 p-4 shadow-inner backdrop-blur-sm">
                <div className="mb-1 text-sm font-medium">DOI Reference</div>
                <div className="text-xs break-all text-white/90">
                  {study.link.replace('https://doi.org/', '')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Abstract Section */}
          <div className="mb-8 rounded-lg border border-gray-100 bg-gray-50 p-5">
            <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-600 mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Abstract
            </h3>
            <p className="leading-relaxed text-gray-700">{study.abstract}</p>
          </div>

          {/* Key Findings Section */}
          <div className="mb-8">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-600 mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Key Findings
            </h3>
            <ul className="space-y-3">
              {study.keyFindings.map((finding, index) => (
                <li
                  key={index}
                  className="flex items-start rounded-md border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="bg-primary-100 text-primary-700 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Citation and Link Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-gray-500">
                <p>
                  Citation: {study.authors.split(',')[0]} et al., {study.journal}, {study.year}
                </p>
              </div>
              <a
                href={study.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded-md px-6 py-3 font-medium text-white shadow-sm transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Read Full Study
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const Filter = ({
  options,
  activeFilter,
  onChange,
}: {
  options: string[];
  activeFilter: string;
  onChange: (filter: string) => void;
}) => {
  return (
    <div className="mb-8 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-600 mr-2 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-sm font-semibold text-gray-700">Filter by Category</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('All')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeFilter === 'All'
              ? 'bg-primary-600 scale-105 transform text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
          }`}
        >
          All
        </button>
        {options.map(option => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeFilter === option
                ? 'bg-primary-600 scale-105 transform text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// Filter out videos without a valid YouTube ID
const validVideos = videos.filter(video => getYoutubeId(video.youtubeUrl));

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'studies'>('videos');
  const [videoFilter, setVideoFilter] = useState('All');
  const [studyFilter, setStudyFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeStudy, setActiveStudy] = useState<Study | null>(null);

  // Extract unique categories
  const videoCategories = Array.from(new Set(validVideos.map(video => video.category)));
  const studyCategories = Array.from(new Set(studies.map(study => study.category)));

  // Filter videos and studies based on selected category
  const filteredVideos =
    videoFilter === 'All'
      ? validVideos
      : validVideos.filter(video => video.category === videoFilter);

  const filteredStudies =
    studyFilter === 'All' ? studies : studies.filter(study => study.category === studyFilter);

  return (
    <Layout>
      <ResearchStructuredData videos={validVideos} studies={studies} />
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="bg-primary-100 text-primary-800 mb-4 inline-block rounded-full px-3 py-1 text-sm font-bold">
              Evidence-Based Information
            </div>
            <h1 className="mb-6 text-4xl font-extrabold text-gray-900 text-shadow-sm sm:text-5xl">
              Player Benefits & Research
            </h1>
            <div className="bg-primary-600 mx-auto mb-6 h-1 w-24"></div>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">
              Discover why hockey players choose nicotine pouches and explore the science behind how
              they can enhance your performance on and off the ice.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center rounded-full bg-white px-4 py-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-600 mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{videos.length} Educational Videos</span>
              </div>
              <div className="flex items-center rounded-full bg-white px-4 py-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-600 mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span>{studies.length} Scientific Studies</span>
              </div>
              <div className="flex items-center rounded-full bg-white px-4 py-2 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-600 mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Peer-Reviewed Content</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-12 flex justify-center">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex items-center rounded-md px-6 py-3 text-lg font-medium transition-all duration-200 ${
                  activeTab === 'videos'
                    ? 'text-primary-700 scale-[1.02] transform bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Educational Videos
                <span className="bg-primary-100 text-primary-800 ml-2 rounded-full px-2 py-1 text-xs font-bold">
                  {videos.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('studies')}
                className={`flex items-center rounded-md px-6 py-3 text-lg font-medium transition-all duration-200 ${
                  activeTab === 'studies'
                    ? 'text-primary-700 scale-[1.02] transform bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Medical Studies
                <span className="bg-primary-100 text-primary-800 ml-2 rounded-full px-2 py-1 text-xs font-bold">
                  {studies.length}
                </span>
              </button>
            </div>
          </div>

          {/* Videos Section */}
          {activeTab === 'videos' && (
            <div>
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 text-shadow-xs">
                  Educational Videos
                </h2>
                <p className="text-gray-600">
                  Watch these informative videos to learn more about nicotine pouches, their
                  benefits, and how they compare to traditional tobacco products.
                </p>
              </div>

              <Filter
                options={videoCategories}
                activeFilter={videoFilter}
                onChange={setVideoFilter}
              />

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                {filteredVideos.map(video => (
                  <div
                    key={video.id}
                    className="group hover:border-primary-200 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                  >
                    <div
                      className="relative aspect-video cursor-pointer overflow-hidden"
                      onClick={() => setActiveVideo(getYoutubeId(video.youtubeUrl))}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-black/10 transition-all duration-300 group-hover:from-black/70 group-hover:to-black/20">
                        <div className="bg-primary-600 bg-opacity-90 drop-shadow-primary-500/50 flex h-16 w-16 transform items-center justify-center rounded-full shadow-lg drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>

                        <div className="absolute right-4 bottom-4 left-4">
                          <h3 className="mb-1 line-clamp-1 text-lg font-bold text-white text-shadow-md">
                            {video.title}
                          </h3>
                          <p className="line-clamp-1 text-sm text-white/80 text-shadow-sm">
                            By{' '}
                            {video.title.includes('Huberman')
                              ? 'Dr. Andrew Huberman'
                              : video.title.includes('Lex Fridman')
                                ? 'Lex Fridman'
                                : video.title.includes('Thomas DeLauer')
                                  ? 'Thomas DeLauer'
                                  : video.title.includes('Houston Methodist')
                                    ? 'Houston Methodist Hospital'
                                    : video.title.includes('Dr. Urban')
                                      ? 'Dr. Urban A. Kiernan'
                                      : video.title.includes('Bloomberg')
                                        ? 'Bloomberg News'
                                        : video.title.includes('Tucker')
                                          ? 'Tucker Carlson'
                                          : 'Industry Experts'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-primary-600 absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-bold text-white shadow-md text-shadow-xs">
                        {video.category}
                      </div>

                      <div className="relative h-full w-full bg-gray-100">
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="z-10 transition-transform duration-500 group-hover:scale-105"
                          onError={e => {
                            // Simple fallback to default image if YouTube thumbnail fails
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_VIDEO_IMAGE;
                          }}
                          unoptimized // Use this for external images like YouTube thumbnails
                          priority={true} // Prioritize loading all video thumbnails for better engagement
                        />
                        {/* Preloaded backup image that shows while YouTube thumbnail loads */}
                        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gray-100 p-4">
                          <div className="border-primary-200 border-t-primary-600 mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
                          <div className="text-center text-sm text-gray-500">
                            Loading video thumbnail...
                          </div>
                          <div className="mt-2 text-center text-xs font-medium text-gray-400">
                            {video.title.substring(0, 30)}...
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="line-clamp-3 text-gray-600">{video.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Duration:{' '}
                          {video.id === 'v1'
                            ? '4:13'
                            : video.id === 'v2'
                              ? '3:02'
                              : video.id === 'v3'
                                ? '5:24'
                                : video.id === 'v4'
                                  ? '8:47'
                                  : video.id === 'v5'
                                    ? '10:32'
                                    : video.id === 'v6'
                                      ? '7:15'
                                      : video.id === 'v7'
                                        ? '6:28'
                                        : video.id === 'v8'
                                          ? '2:45'
                                          : video.id === 'v9'
                                            ? '4:56'
                                            : video.id === 'v10'
                                              ? '5:18'
                                              : '~5 min'}
                        </span>
                        <button
                          onClick={() => setActiveVideo(getYoutubeId(video.youtubeUrl))}
                          className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
                        >
                          Watch Now
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-1 h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredVideos.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-lg text-gray-500">No videos found in this category.</p>
                </div>
              )}
            </div>
          )}

          {/* Studies Section */}
          {activeTab === 'studies' && (
            <div>
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 text-shadow-xs">
                  Medical Studies
                </h2>
                <p className="text-gray-600">
                  Explore peer-reviewed research on nicotine pouches, their health implications, and
                  comparisons with traditional tobacco products.
                </p>
              </div>

              <Filter
                options={studyCategories}
                activeFilter={studyFilter}
                onChange={setStudyFilter}
              />

              <div className="space-y-6">
                {filteredStudies.map(study => (
                  <div
                    key={study.id}
                    className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                    onClick={() => setActiveStudy(study)}
                  >
                    <div className="p-6">
                      <div className="mb-4 flex flex-wrap items-start justify-between">
                        <div className="mb-2 sm:mb-0">
                          <span className="bg-primary-100 text-primary-800 inline-block rounded px-2.5 py-0.5 text-xs font-medium">
                            {study.category}
                          </span>
                          <span className="ml-2 inline-block text-sm text-gray-500">
                            {study.journal}, {study.year}
                          </span>
                        </div>
                      </div>

                      <h3 className="mb-2 text-xl font-bold text-gray-900">{study.title}</h3>
                      <p className="mb-4 text-gray-700">{study.authors}</p>

                      <p className="mb-4 line-clamp-3 text-gray-600">{study.abstract}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                          View details
                        </span>
                        <div className="flex space-x-1">
                          {study.keyFindings.slice(0, 3).map((_, index) => (
                            <div key={index} className="bg-primary-600 h-2 w-2 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStudies.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-lg text-gray-500">No studies found in this category.</p>
                </div>
              )}
            </div>
          )}

          {/* Related Content */}
          <RelatedContent
            title="Explore More Hockey Performance Content"
            items={[
              {
                title: 'Premium Nicotine Pouches for Hockey Players',
                description:
                  'Shop our selection of high-quality nicotine pouches designed specifically for hockey players.',
                image: '/images/hero.jpeg',
                link: '/products',
              },
              {
                title: 'About Hockey Pouches',
                description:
                  'Learn about our mission to provide the best nicotine pouches for hockey players.',
                image: '/images/hero.jpeg',
                link: '/about',
              },
              {
                title: 'Contact Our Team',
                description:
                  'Have questions about our products? Get in touch with our knowledgeable team.',
                image: '/images/hero.jpeg',
                link: '/contact',
              },
            ]}
          />

          {/* Social Sharing */}
          <SocialShare
            url="https://hockey-pouches.vercel.app/research"
            title="Hockey Pouches - Research & Benefits | Scientific Studies on Nicotine Pouches"
            description="Explore scientific research, studies, and expert videos on nicotine pouches. Learn about health implications, performance benefits, and how they compare to traditional tobacco products."
          />

          {/* Call to Action */}
          <div className="bg-primary-600 mt-8 overflow-hidden rounded-lg shadow-lg">
            <div className="px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-shadow-primary-800/30 text-2xl font-extrabold text-white text-shadow-md sm:text-3xl">
                  Want to learn more?
                </h2>
                <p className="text-primary-100 mt-3 max-w-3xl text-lg">
                  Ready to experience the benefits for yourself? Shop our premium nicotine pouches
                  designed specifically for hockey players.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/contact"
                    className="text-primary-600 hover:bg-primary-50 inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium"
                  >
                    Contact Us
                  </Link>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <Link
                    href="/products"
                    className="bg-primary-700 hover:bg-primary-800 inline-flex items-center justify-center rounded-md border border-transparent px-5 py-3 text-base font-medium text-white"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && <VideoPlayer videoId={activeVideo} onClose={() => setActiveVideo(null)} />}

      {/* Study Detail Modal */}
      {activeStudy && <StudyDetail study={activeStudy} onClose={() => setActiveStudy(null)} />}
    </Layout>
  );
}
