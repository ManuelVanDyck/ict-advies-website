'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { generateOpdrachtPDF, PDFData } from '@/lib/pdf/opdracht-pdf';
import { Loader2, Download, Save, Send, FileText, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Lock } from 'lucide-react';

interface Criterium {
  naam: string;
  beschrijving: string;
  gewicht: number;
}

interface Opdracht {
  titel: string;
  instructie: string;
  criteria: Criterium[];
  maxScore: number;
  deadline?: string;
  verplicht?: boolean;
}

interface OpdrachtTekstComponentProps {
  opdracht: Opdracht;
  tutorialId: string;
  tutorialSlug: string;
  opdrachtId: string;
  tutorialTitle: string;
}

interface AntwoordData {
  [key: string]: string;
}

// Module volgorde mapping
const MODULE_ORDER: Record<string, number> = {
  'ai-bewustzijn-module-1': 1,
  'ai-bewustzijn-module-2': 2,
  'ai-bewustzijn-module-3': 3,
  'ai-bewustzijn-module-4': 4,
};

const PASSING_SCORE = 50;

export default function OpdrachtTekstComponent({
  opdracht,
  tutorialId,
  tutorialSlug,
  opdrachtId,
  tutorialTitle,
}: OpdrachtTekstComponentProps) {
  const { data: session } = useSession();
  const [antwoorden, setAntwoorden] = useState<AntwoordData>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score?: number;
    feedback?: string;
    details?: Array<{ criterium: string; score: number; feedback: string }>;
    status: string;
  } | null>(null);
  const [savedDraft, setSavedDraft] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<Record<string, { completed: boolean; score: number; unlocked: boolean; passed: boolean }>>({});
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const currentModuleIndex = MODULE_ORDER[tutorialSlug] || 1;

  // Initialize antwoorden
  const initialAntwoorden: AntwoordData = {};
  opdracht.criteria.forEach((c) => {
    initialAntwoorden[c.naam] = '';
  });

  // Check module access on mount
  useEffect(() => {
    const checkAccess = async () => {
      if (!session?.user?.email) {
        setCheckingAccess(false);
        return;
      }

      try {
        const response = await fetch(`/api/leerpad/voortgang/modules?user_email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setModuleProgress(data.moduleProgress || {});

          // Check if this module is unlocked
          const thisModule = data.moduleProgress?.[tutorialSlug];
          if (currentModuleIndex > 1 && !thisModule?.unlocked) {
            setAccessDenied(true);
          }
        }
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [session?.user?.email, tutorialSlug, currentModuleIndex]);

  // Get next module slug
  const getNextModuleSlug = (): string | null => {
    const nextIndex = currentModuleIndex + 1;
    const nextSlug = Object.entries(MODULE_ORDER).find(([_, idx]) => idx === nextIndex)?.[0];
    return nextSlug || null;
  };

  const handleAntwoordChange = (criterium: string, value: string) => {
    setAntwoorden(prev => ({ ...prev, [criterium]: value }));
    setSavedDraft(false);
  };

  const handleSaveDraft = async () => {
    if (!session?.user?.email) {
      alert('Je moet ingelogd zijn om op te slaan.');
      return;
    }

    try {
      const response = await fetch('/api/opdracht/voortgang/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: session.user.email,
          user_name: session.user.name,
          tutorial_id: tutorialId,
          tutorial_slug: tutorialSlug,
          opdracht_id: opdrachtId,
          opdracht_titel: opdracht.titel,
          antwoorden,
          status: 'bezig',
        }),
      });

      if (response.ok) {
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Er ging iets mis bij het opslaan van je concept.');
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      alert('Je moet ingelogd zijn om in te dienen.');
      return;
    }

    const incomplete = opdracht.criteria.some(c => !antwoorden[c.naam] || antwoorden[c.naam].trim() === '');
    if (incomplete) {
      alert('Vul eerst alle vragen in voordat je indient.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/opdracht/voortgang/indienen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: session.user.email,
          user_name: session.user.name,
          tutorial_id: tutorialId,
          tutorial_slug: tutorialSlug,
          opdracht_id: opdrachtId,
          opdracht_titel: opdracht.titel,
          instructie: opdracht.instructie,
          criteria: opdracht.criteria,
          antwoorden,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          score: data.score,
          feedback: data.feedback,
          details: data.details,
          status: 'voltooid',
        });
      } else {
        throw new Error(data.error || 'Er ging iets mis');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Er ging iets mis bij het indienen. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAntwoorden(initialAntwoorden);
  };

  const handleDownloadPDF = () => {
    const pdfData: PDFData = {
      tutorial: tutorialTitle,
      opdracht_titel: opdracht.titel,
      instructie: opdracht.instructie,
      antwoorden,
      score: result?.score,
      feedback: result?.feedback,
      details: result?.details,
      user_name: session?.user?.name || 'Onbekend',
      date: new Date().toLocaleDateString('nl-BE'),
    };

    const blob = generateOpdrachtPDF(pdfData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opdracht-${opdrachtId}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isPassed = result?.score !== undefined && result.score >= PASSING_SCORE;
  const nextModuleSlug = getNextModuleSlug();

  // Loading state
  if (checkingAccess) {
    return (
      <div className="bg-brand-cream rounded-lg p-6 mt-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
        </div>
      </div>
    );
  }

  // Access denied - show locked message
  if (accessDenied) {
    return (
      <div className="bg-brand-cream rounded-lg p-6 mt-8">
        <div className="flex items-center gap-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Lock className="w-8 h-8 text-yellow-600" />
          <div>
            <h3 className="font-bold text-yellow-800 mb-1">Module vergrendeld</h3>
            <p className="text-yellow-700">
              Je moet eerst Module {currentModuleIndex - 1} voltooien (score ≥ {PASSING_SCORE}%) voordat je deze module kunt starten.
            </p>
            <Link
              href="/leerpaden/ai-bewustzijn"
              className="mt-3 inline-flex items-center gap-2 text-brand-red hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Terug naar leerpad
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream rounded-lg p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-brand-red flex items-center gap-2">
          <FileText className="w-6 h-6" />
          {opdracht.titel}
          {opdracht.verplicht && (
            <span className="text-xs bg-brand-red text-white px-2 py-1 rounded-full">Verplicht</span>
          )}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={loading || result !== null}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Concept opslaan
          </button>
          {savedDraft && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Opgeslagen
            </span>
          )}
        </div>
      </div>

      <div className="prose prose-sm max-w-none mb-6">
        <p className="text-gray-700">{opdracht.instructie}</p>
      </div>

      {result === null ? (
        <>
          {/* Vragen */}
          <div className="space-y-6 mb-6">
            {opdracht.criteria.map((criterium) => (
              <div key={criterium.naam} className="bg-white rounded-lg p-4">
                <label className="block font-semibold text-gray-800 mb-2">
                  {criterium.naam} <span className="text-sm text-gray-500">({criterium.gewicht}%)</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">{criterium.beschrijving}</p>
                <textarea
                  value={antwoorden[criterium.naam] || ''}
                  onChange={(e) => handleAntwoordChange(criterium.naam, e.target.value)}
                  placeholder="Schrijf je antwoord hier..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent resize-y min-h-[120px]"
                  rows={5}
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          {/* Indienen knop */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Indienen...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Indienen
              </>
            )}
          </button>
        </>
      ) : (
        /* Resultaat */
        <div className="space-y-6">
          {/* Score display */}
          <div className="bg-white rounded-lg p-6 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${
              isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isPassed ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              Score: {result.score}/100
              {isPassed ? ' - Geslaagd!' : ' - Niet geslaagd'}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg p-6">
            <h4 className="font-semibold mb-3">Feedback</h4>
            <p className="text-gray-700">{result.feedback}</p>
          </div>

          {/* Details per criterium */}
          {result.details && result.details.length > 0 && (
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold mb-4">Details per criterium</h4>
              <div className="space-y-4">
                {result.details.map((detail, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{detail.criterium}</span>
                      <span className={`font-bold ${
                        detail.score >= 70 ? 'text-green-600' :
                        detail.score >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {detail.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{detail.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actie knoppen */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isPassed && nextModuleSlug ? (
              <Link
                href={`/tutorials/${nextModuleSlug}`}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Volgende module
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : !isPassed ? (
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Opnieuw proberen
              </button>
            ) : null}

            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {/* Info bij niet geslaagd */}
          {!isPassed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Herkansing:</strong> Je moet minimaal {PASSING_SCORE}% halen om door te gaan naar de volgende module. 
                Verbeter je antwoorden en dien opnieuw in.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
