'use client';

import { useState } from 'react';
import {
  PortableText,
  type PortableTextComponents,
} from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityImageUrl';

// Simple inline components for accordion content
const accordionComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 text-gray-900">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6 text-gray-900">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900">{children}</h3>,
    normal: ({ children }) => <p className="mb-3 leading-relaxed text-gray-700">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return <a href={value?.href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className="text-brand-red hover:underline">{children}</a>;
    },
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
  },
};

interface AccordionSectionProps {
  value: {
    title?: string;
    defaultOpen?: boolean;
    content?: any[];
  };
}

export default function AccordionSection({ value }: AccordionSectionProps) {
  const { title, defaultOpen, content } = value;
  const [isOpen, setIsOpen] = useState(defaultOpen || false);

  if (!title || !content) return null;

  return (
    <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900 pr-4">{title}</h2>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-6 bg-white">
          <PortableText value={content} components={accordionComponents} />
        </div>
      )}
    </div>
  );
}
