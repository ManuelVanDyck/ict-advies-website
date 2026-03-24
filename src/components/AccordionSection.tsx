'use client';

import { useState } from 'react';
import CustomPortableText from './PortableText';

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
          <CustomPortableText value={content} />
        </div>
      )}
    </div>
  );
}
