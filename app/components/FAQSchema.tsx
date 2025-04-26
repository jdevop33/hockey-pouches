'use client';

import React from 'react';
import Script from 'next/script';

interface FAQProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function FAQSchema({ faqs }: FAQProps) {
  // Create structured data for FAQPage using JSON-LD format
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
