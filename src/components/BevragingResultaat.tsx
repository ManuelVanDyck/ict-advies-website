'use client';

import { useEffect, useState } from 'react';
import { Award, Target, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface BevragingResultaat {
  heeftBevraging: boolean;
  totaalscore?: number;
  maxScore?: number;
  scores?: { categorie: string; score: number; max: number }[];
  niveau?: string;
  profiel?: string;
  aanbevolenLeerpaden?: string[];
  message?: string;
}

export default function BevragingResultaat() {
  const [resultaat, setResultaat] = useState<BevragingResultaat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bevraging')
      .then(res => res.json())
      .then(data => {
        setResultaat(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!resultaat?.heeftBevraging) {
    return (
      <div className="bg-gradient-to-r from-[#e53013] to-[#c42a10] text-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Target className="w-6 h-6" />
          Start je zelfevaluatie
        </h2>
        <p className="opacity-90 mb-4">
          Vul de bevraging in om je digitale vaardigheden in kaart te brengen en gepersonaliseerde leerpaden te ontvangen.
        </p>
        <Link
          href="https://docs.google.com/forms/d/15BLvAJjZy5NeZbWEH4RlhBe41n4xJb9mc3cLV3k3i7Q/viewform"
          target="_blank"
          className="inline-flex items-center gap-2 bg-white text-[#e53013] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Start de bevraging
          <BookOpen className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const percentage = Math.round((resultaat.totaalscore! / resultaat.maxScore!) * 100);

  const leerpadNamen: Record<string, string> = {
    'digitale-basis': 'Digitale basis',
    'digitale-integratie': 'Digitale integratie',
    'digitale-verdieping': 'Digitale verdieping',
    'digitale-innovatie': 'Digitale innovatie',
    'ai-bewustzijn': 'AI bewustzijn',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#4c8077] flex items-center gap-2">
            <Award className="w-6 h-6" />
            Je resultaat
          </h2>
          <p className="text-gray-600">Op basis van je zelfevaluatie</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-[#e53013]">{resultaat.totaalscore}</div>
          <div className="text-sm text-gray-500">van de {resultaat.maxScore} punten</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Niveau: {resultaat.niveau}</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#4c8077] to-[#e53013] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Scores per categorie */}
      {resultaat.scores && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {resultaat.scores.map((score) => (
            <div key={score.categorie} className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{score.categorie}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#4c8077]">{score.score}</span>
                <span className="text-sm text-gray-500">/ {score.max}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aanbevolen leerpaden */}
      {resultaat.aanbevolenLeerpaden && resultaat.aanbevolenLeerpaden.length > 0 && (
        <div className="bg-[#fee4cc] rounded-lg p-4">
          <h3 className="font-semibold text-[#4c8077] mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Aanbevolen leerpaden
          </h3>
          <div className="flex flex-wrap gap-2">
            {resultaat.aanbevolenLeerpaden.map((slug) => (
              <Link
                key={slug}
                href={`/leerpaden/${slug}`}
                className="bg-white px-4 py-2 rounded-lg text-[#e53013] font-medium hover:bg-gray-50 transition-colors"
              >
                {leerpadNamen[slug] || slug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
