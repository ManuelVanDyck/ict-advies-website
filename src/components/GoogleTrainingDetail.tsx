'use client';

import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TrainingDetailProps {
  slug: string;
}

const trainings: Record<string, { title: string; duration: string; externalUrl: string; description: string }> = {
  'google-vids-training': {
    title: "Makkelijk video's maken voor het onderwijs met Google Vids",
    duration: "45 min",
    externalUrl: "https://edu.exceedlms.com/student/activity/1721248-makkelijk-video-s-maken-voor-het-onderwijs-met-google-vids",
    description: "In deze cursus maak je kennis met Google Vids als tool voor in de les. Je leert schermopnamen te importeren, video's te delen om te bekijken of samen aan te werken en gebruik te maken van AI om gestroomlijnd video's te maken. Video's zorgen voor meer betrokkenheid, stimuleren creativiteit en geven leerlingen een manier om hun leerervaringen te delen. Ontdek de mogelijkheden van video's voor betere lessen en effectievere leerervaringen met Google Vids."
  },
  'google-workspace-basis': {
    title: "Basisprincipes van Google Workspace for Education Fundamentals",
    duration: "2,3 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1720101-basisprincipes-van-google-workspace-for-education-fundamentals",
    description: "In deze cursus maak je kennis met alle tools die Google Workspace for Education te bieden heeft. Je ontwikkelt de digitale vaardigheden die nodig zijn om materiaal te maken in de tools en je ontdekt hoe je deze vaardigheden kunt toepassen om digitaal leren te integreren in je klas."
  },
  'google-workspace-gevorderd': {
    title: "Gevorderd gebruik van Google Workspace for Education Fundamentals",
    duration: "2,2 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1720586-gevorderd-gebruik-van-google-workspace-for-education-fundamentals",
    description: "In deze cursus werk je verder aan de vaardigheden die je al hebt met de tools die Google Workspace for Education biedt. Je verbetert de effectiviteit van je werk door automatisering, personalisatie en gestroomlijnde processen voor je lesgroep en onderwijsinstelling."
  },
  'google-premium-functies': {
    title: "Premium functies voor leerlingen en docenten",
    duration: "1,4 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1722046-premium-functies-voor-leerlingen-en-docenten",
    description: "Met de Teaching and Learning Upgrade- en Education Plus-versies van Google Workspace for Education krijg je toegang tot extra functies. In deze cursus leer je de digitale vaardigheden die je nodig hebt om de voordelen van Google-tools zoals Classroom en Meet te maximaliseren en ontdek je hoe je deze kunt toepassen voor meer onderwijsimpact in de klas."
  },
  'digitaal-burgerschap-veiligheid': {
    title: "Cursus 'Digitaal burgerschap en veiligheid'",
    duration: "2,2 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1719755-cursus-digitaal-burgerschap-en-veiligheid",
    description: "In deze cursus leer je over digitaal burgerschap en veiligheid in het onderwijs. Ontdek hoe je leerlingen kunt begeleiden in de digitale wereld en hoe je veilig omgaat met online tools en informatie."
  },
  'onderwijs-op-afstand': {
    title: "Onderwijs op afstand voor docenten",
    duration: "2,6 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1719121-onderwijs-op-afstand-voor-docenten",
    description: "In deze cursus leer je effectief lesgeven op afstand met Google tools. Ontdek hoe je virtuele lessen kunt geven, samenwerken met leerlingen en ouders, en digitale tools kunt inzetten voor onderwijs op afstand."
  },
  'certified-coaches': {
    title: "Lesprogramma voor Certified Coaches",
    duration: "10 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1718795-lesprogramma-voor-certified-coaches",
    description: "Dit lesprogramma volgt het 5-stappen coachingmodel: De uitdaging identificeren, Onderzoeken, Een strategie selecteren, Een strategie implementeren en Reflecteren op de cyclus. Word een gecertificeerde Google Coach en ondersteun collega's in hun professionele ontwikkeling."
  },
  'google-ai-onderwijs': {
    title: "Aan de slag met AI van Google in het basis- en middelbaar onderwijs",
    duration: "2 uur",
    externalUrl: "https://edu.exceedlms.com/student/activity/1781402-aan-de-slag-met-ai-van-google-in-het-basis-en-middelbaar-onderwijs",
    description: "In deze cursus leer je hoe je Gemini als je assistent op het werk kunt inzetten om tijd te besparen en je creativiteit de vrije loop te laten bij alledaagse taken. Je leert hoe je Gemini direct, als zelfstandige tool gebruikt in verschillende Google Workspace for Education-apps, zoals Documenten, Gmail en Presentaties."
  }
};

export default function GoogleTrainingDetail({ slug }: TrainingDetailProps) {
  const training = trainings[slug];
  
  if (!training) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <p className="text-gray-500">Training niet gevonden.</p>
        <Link 
          href="/tutorials/google-online-trainingen"
          className="inline-flex items-center gap-2 text-brand-red hover:text-red-700 font-medium mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Alle Google trainingen
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
      {/* Training info */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full mb-4">
          ⏱️ {training.duration}
        </span>
        <p className="text-gray-600 text-lg leading-relaxed">
          {training.description}
        </p>
      </div>

      {/* CTA Button */}
      <a
        href={training.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        <ExternalLink className="w-5 h-5" />
        Start de training
      </a>

      <p className="text-sm text-gray-400 mt-4">
        Deze training wordt aangeboden door Google for Education
      </p>
    </div>
  );
}
