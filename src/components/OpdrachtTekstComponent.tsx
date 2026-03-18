'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { generateOpdrachtPDF, PDFData } from '@/lib/pdf/opdracht-pdf';
import { Loader2, Download, Save, Send, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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

  // Initialize antwoorden with empty strings for each criterium
  const initialAntwoorden: AntwoordData = {};
  opdracht.criteria.forEach((c) => {
    initialAntwoorden[c.naam] = '';
  });

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

    // Check of alle verplichte velden ingevuld zijn
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
          <div className="bg-white rounded-lg p-6 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${
              result.score! >= 70 ? 'bg-green-100 text-green-700' :
              result.score! >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {result.score! >= 70 ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              Score: {result.score}/100
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h4 className="font-semibold mb-3">Feedback</h4>
            <p className="text-gray-700">{result.feedback}</p>
          </div>

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

          {/* PDF download */}
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download als PDF
          </button>
        </div>
      )}
    </div>
  );
}
