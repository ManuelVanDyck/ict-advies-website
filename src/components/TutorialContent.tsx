'use client';

import CustomPortableText from '@/components/PortableText';

interface TutorialContentProps {
  body: any;
}

export default function TutorialContent({ body }: TutorialContentProps) {
  if (!body) return null;
  
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
      <CustomPortableText value={body} />
    </div>
  );
}
