'use client';

import Link from 'next/link';
import { Play, Clock, ExternalLink } from 'lucide-react';

interface Training {
  title: string;
  slug: string;
  duration: string;
  externalUrl: string;
  description?: string;
}

const trainings: Training[] = [
  {
    title: "Makkelijk video's maken voor het onderwijs met Google Vids",
    slug: "google-vids-training",
    duration: "45 min",
    externalUrl: "https://edu.exceedlms.com/student/activity/1721248-makkelijk-video-s-maken-voor-het-onderwijs-met-google-vids",
    description: "Leer eenvoudig educatieve video's maken met Google Vids"
  },
  {
    title: "Basisprincipes van Google Workspace for Education Fundamentals",
    slug: "google-workspace-basis",
    duration: "2,3 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1720101-basisprincipes-van-google-workspace-for-education-fundamentals",
    description: "De fundamenten van Google Workspace voor in de klas"
  },
  {
    title: "Gevorderd gebruik van Google Workspace for Education Fundamentals",
    slug: "google-workspace-gevorderd",
    duration: "2,2 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1720586-gevorderd-gebruik-van-google-workspace-for-education-fundamentals",
    description: "Duik dieper in de mogelijkheden van Google Workspace"
  },
  {
    title: "Premium functies voor leerlingen en docenten",
    slug: "google-premium-functies",
    duration: "1,4 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1722046-premium-functies-voor-leerlingen-en-docenten",
    description: "Ontdek de extra mogelijkheden van de premium versie"
  },
  {
    title: "Cursus 'Digitaal burgerschap en veiligheid'",
    slug: "digitaal-burgerschap-veiligheid",
    duration: "2,2 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1719755-cursus-digitaal-burgerschap-en-veiligheid",
    description: "Leer over digitale veiligheid en burgerschap"
  },
  {
    title: "Onderwijs op afstand voor docenten",
    slug: "onderwijs-op-afstand",
    duration: "2,6 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1719121-onderwijs-op-afstand-voor-docenten",
    description: "Effectief lesgeven op afstand met Google tools"
  },
  {
    title: "Lesprogramma voor Certified Coaches",
    slug: "certified-coaches",
    duration: "10 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1718795-lesprogramma-voor-certified-coaches",
    description: "Word een gecertificeerde Google Coach"
  },
  {
    title: "Aan de slag met AI van Google in het basis- en middelbaar onderwijs",
    slug: "google-ai-onderwijs",
    duration: "2 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1781402-aan-de-slag-met-ai-van-google-in-het-basis-en-middelbaar-onderwijs",
    description: "Ontdek AI-mogelijkheden voor in de klas"
  }
];

export default function GoogleTrainingenHub() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {trainings.map((training) => (
        <Link
          key={training.slug}
          href={`/tutorials/${training.slug}`}
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-brand-orange"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white" fill="white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {training.duration}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors mb-1 line-clamp-2">
                {training.title}
              </h3>
              {training.description && (
                <p className="text-gray-500 text-sm line-clamp-2">{training.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
