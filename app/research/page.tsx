'use client';

// Only keep imports that are actually used
import { Suspense } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/NewLayout';
import ResearchStructuredData from '../components/seo/ResearchStructuredData';
import { benefits, studies, videos } from './data';
import { getYoutubeId } from '../lib/utils';

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

// Video Section
const VideoSection = () => (
  <section className="bg-dark-500 py-16">
    <div className="container mx-auto px-4">
      <h2 className="text-light-100 mb-8 text-center text-3xl font-bold md:text-4xl">
        Expert Insights
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {videos.map(video => (
          <div key={video.id} className="overflow-hidden rounded-lg bg-dark-400 shadow-xl">
            <div className="relative h-0 pb-[56.25%]">
              <iframe
                className="absolute left-0 top-0 h-full w-full"
                src={video.youtubeUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h3 className="text-light-100 mb-2 text-xl font-semibold">{video.title}</h3>
              <p className="text-light-300">{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Studies Section
const StudiesSection = () => (
  <section className="bg-dark-600 py-16">
    <div className="container mx-auto px-4">
      <h2 className="text-light-100 mb-8 text-center text-3xl font-bold md:text-4xl">
        Scientific Research
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {studies.map(study => (
          <div key={study.id} className="overflow-hidden rounded-lg bg-dark-400 shadow-xl">
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

// Benefits Section
const BenefitsSection = () => (
  <section className="bg-dark-400 py-16">
    <div className="container mx-auto px-4">
      <h2 className="text-light-100 mb-3 text-center text-3xl font-bold md:text-4xl">
        Exclusive Sensory Experiences
      </h2>
      <p className="text-light-300 mx-auto mb-12 max-w-3xl text-center">
        Our artfully crafted nicotine pouches deliver an intimate experience for the sophisticated
        adult seeking intense pleasure and exquisite sensations in every private moment.
      </p>

      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map(benefit => (
          <div key={benefit.id} className="rounded-lg bg-dark-500 p-6 shadow-xl">
            <div className="mb-4 text-accent-500">{benefit.icon}</div>
            <h3 className="text-light-100 mb-2 text-xl font-semibold">{benefit.title}</h3>
            <p className="text-light-300">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-light-300 mx-auto mb-8 max-w-3xl">
          Our premium nicotine pouches are designed for those who pursue intense pleasure and
          refined indulgence. Whether engaged in seductive negotiations, captivating your desired
          companion, or savoring moments of personal ecstasy, our products heighten the intimate
          experiences that define your passionate lifestyle.
        </p>
        <Link href="/products">
          <button className="bg-accent-500 px-6 py-3 font-bold text-black hover:bg-accent-400">
            Discover Your Pleasure
          </button>
        </Link>
      </div>
    </div>
  </section>
);

// Hero Section
const HeroSection = () => (
  <section className="relative bg-dark-600 py-24">
    <div className="container relative z-10 mx-auto px-4">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-light-100 mb-6 text-4xl font-bold md:text-5xl">
          The Art of Sensual Indulgence
        </h1>
        <p className="text-light-300 mb-8 text-xl">
          Experience how our exclusive nicotine pouches are meticulously crafted to intensify your
          most intimate and private moments of pleasure.
        </p>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-dark-700 to-dark-600 opacity-90"></div>
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
