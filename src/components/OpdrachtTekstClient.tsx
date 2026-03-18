'use client';

import dynamic from 'next/dynamic';

const OpdrachtTekstComponent = dynamic(
  () => import('@/components/OpdrachtTekstComponent'),
  { ssr: false }
);

interface OpdrachtTekstClientProps {
  opdracht: any;
  tutorialId: string;
  tutorialSlug: string;
  opdrachtId: string;
  tutorialTitle: string;
}

export default function OpdrachtTekstClient({
  opdracht,
  tutorialId,
  tutorialSlug,
  opdrachtId,
  tutorialTitle,
}: OpdrachtTekstClientProps) {
  return (
    <OpdrachtTekstComponent
      opdracht={opdracht}
      tutorialId={tutorialId}
      tutorialSlug={tutorialSlug}
      opdrachtId={opdrachtId}
      tutorialTitle={tutorialTitle}
    />
  );
}
