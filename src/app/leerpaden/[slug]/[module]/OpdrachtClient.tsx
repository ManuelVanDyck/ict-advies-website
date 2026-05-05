'use client';

import OpdrachtComponent from '@/components/OpdrachtComponent';

interface Criterium {
  naam: string;
  beschrijving?: string;
  gewicht: number;
}

interface Opdracht {
  titel: string;
  instructie: string;
  templateSheetUrl?: string;
  criteria: Criterium[];
  maxScore: number;
  deadline?: string;
  screenshotOnly?: boolean;
  voorbeeld?: string;
}

interface OpdrachtClientProps {
  opdracht: Opdracht;
  tutorialId: string;
  tutorialSlug: string;
}

export default function OpdrachtClient({ opdracht, tutorialId, tutorialSlug }: OpdrachtClientProps) {
  return (
    <OpdrachtComponent
      opdracht={opdracht}
      tutorialId={tutorialId}
      tutorialSlug={tutorialSlug}
    />
  );
}
