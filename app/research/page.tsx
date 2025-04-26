'use client';

// Only keep imports that are actually used
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout';
import ResearchStructuredData from '../components/seo/ResearchStructuredData';
import { benefits, studies, videos } from './data';
import { getYoutubeId } from '../lib/utils';
import VideoThumbnail from '../components/ui/VideoThumbnail';

// Filter out videos without a valid YouTube ID
const validVideos = videos.filter(video => getYoutubeId(video.youtubeUrl));

// Loading component
function AboutLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-1/3 rounded bg-dark-700"></div>
      <div className="mt-4 h-4 w-full rounded bg-dark-700"></div>
      <div className="mt-2 h-4 w-full rounded bg-dark-700"></div>
      <div className="mt-2 h-4 w-2/3 rounded bg-dark-700"></div>
    </div>
  );
}

// Video Player Modal Component
const VideoPlayer = ({ videoId, onClose }: { videoId: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 mx-auto w-full max-w-4xl rounded-xl border border-gold-500/20 bg-dark-800 p-4 shadow-xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Video Player</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-dark-700 p-2 text-gray-400 transition-colors hover:bg-dark-600 hover:text-white"
            aria-label="Close video player"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="aspect-video relative w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

// Video Section with thumbnails instead of embedded iframes
const VideoSection = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    // Listen for the custom play-video event
    const handlePlayVideo = (e: CustomEvent<{ videoId: string }>) => {
      setActiveVideo(e.detail.videoId);
    };

    // Add event listener
    document.addEventListener('play-video', handlePlayVideo as EventListener);

    // Clean up
    return () => {
      document.removeEventListener('play-video', handlePlayVideo as EventListener);
    };
  }, []);

  const handleCloseVideo = () => {
    setActiveVideo(null);
  };

  return (
    <section className="bg-dark-500 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-light-100 mb-10 text-center text-3xl font-bold md:text-4xl">
          Expert Insights
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {videos.map(video => {
            const videoId = getYoutubeId(video.youtubeUrl);
            if (!videoId) return null;

            return (
              <div
                key={video.id}
                className="overflow-hidden rounded-lg bg-dark-400 shadow-xl transition-transform duration-300 hover:-translate-y-1"
              >
                <VideoThumbnail
                  youtubeUrl={video.youtubeUrl}
                  title={video.title}
                  thumbnailUrl={video.thumbnailUrl}
                  backupThumbnailUrl={video.backupThumbnailUrl}
                  videoId={videoId}
                  className="cursor-pointer"
                />
                <div className="p-6">
                  <h3 className="text-light-100 mb-2 text-xl font-semibold">{video.title}</h3>
                  <p className="text-light-300">{video.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && <VideoPlayer videoId={activeVideo} onClose={handleCloseVideo} />}
    </section>
  );
};

// Studies Section
const StudiesSection = () => (
  <section className="bg-dark-600 py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-light-100 mb-10 text-center text-3xl font-bold md:text-4xl">
        Scientific Research
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {studies.map(study => (
          <div
            key={study.id}
            className="overflow-hidden rounded-lg bg-dark-400 shadow-xl transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="p-6">
              <h3 className="text-light-100 mb-2 text-xl font-semibold">{study.title}</h3>
              <p className="text-light-300 mb-4">{study.abstract}</p>
              <a
                href={study.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-500 transition-colors hover:text-accent-400"
              >
                Read Full Study →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Hero Section
const HeroSection = () => (
  <section className="relative py-32 md:py-40">
    {/* Background Image */}
    <div className="absolute inset-0 z-0">
      <img
        src="/images/products/benefits_hero.jpg"
        alt="Research background"
        className="h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-800/70"></div>
    </div>

    {/* Content */}
    <div className="container relative z-10 mx-auto px-4">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-light-100 mb-6 text-4xl font-bold md:text-5xl">
          The Art of Refined Sensation
        </h1>
        <p className="text-light-300 mb-8 text-xl">
          Experience how our exclusive nicotine pouches are meticulously crafted to enhance your
          moments of focus, elevate your social experiences, and provide a discreet rush of
          satisfaction.
        </p>
      </div>
    </div>
  </section>
);

// Benefits Section
const BenefitsSection = () => (
  <section className="bg-dark-400 py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-light-100 mb-4 text-center text-3xl font-bold md:text-4xl">
        Exclusive Sensory Experiences
      </h2>
      <p className="text-light-300 mx-auto mb-14 max-w-3xl text-center">
        Our artfully crafted nicotine pouches deliver refined experiences for the sophisticated
        adult seeking exceptional flavor profiles and moments of discreet enjoyment.
      </p>

      <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map(benefit => (
          <div
            key={benefit.id}
            className="rounded-lg bg-dark-500 p-6 shadow-xl transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="mb-4 text-accent-500">{benefit.icon}</div>
            <h3 className="text-light-100 mb-2 text-xl font-semibold">{benefit.title}</h3>
            <p className="text-light-300">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-light-300 mx-auto mb-8 max-w-3xl">
          Our premium nicotine pouches are designed for those who appreciate refined indulgence.
          Whether engaged in focused negotiations, enjoying elevated social gatherings, or savoring
          moments of personal reflection, our products enhance the experiences that define your
          sophisticated lifestyle.
        </p>
        <Link href="/products">
          <button className="bg-accent-500 px-8 py-3 font-bold text-black transition-all hover:bg-accent-400 hover:shadow-lg">
            Discover Your Experience
          </button>
        </Link>
      </div>
    </div>
  </section>
);

// Main Page Component
export default function ResearchPage() {
  return (
    <Suspense fallback={<AboutLoading />}>
      <Layout>
        <ResearchStructuredData videos={validVideos} studies={studies} />
        <div className="min-h-screen bg-black text-white">
          <HeroSection />
          <BenefitsSection />
          <VideoSection />
          <StudiesSection />
        </div>
      </Layout>
    </Suspense>
  );
}
