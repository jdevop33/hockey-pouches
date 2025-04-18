'use client';

import Link from 'next/link';
import Image from 'next/image';

interface RelatedContentProps {
  title: string;
  items: {
    title: string;
    description: string;
    image: string;
    link: string;
  }[];
}

export default function RelatedContent({ title, items }: RelatedContentProps) {
  return (
    <div className="mt-16 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            className="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-200"
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
