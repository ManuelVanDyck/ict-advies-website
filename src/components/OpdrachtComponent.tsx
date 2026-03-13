'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase/client';
import { Upload, X, Image as ImageIcon, Loader2, Search } from 'lucide-react';

interface Criterium {
  naam: string;
  beschrijving?: string;
  verwacht?: string;
  controleer?: string[];
  gewicht: number;
}

interface Opdracht {
  titel: string;
  instructie: string;
  templateSheetUrl?: string;
  criteria: Criterium[];
  maxScore: number;
  deadline?: string;
}

interface OpdrachtComponentProps {
  opdracht: Opdracht;
  tutorialId: string;
  tutorialSlug: string;
}

export default function OpdrachtComponent({ 
  opdracht, 
  tutorialId, 
  tutorialSlug 
}: OpdrachtComponentProps) {
  const { data: session } = useSession();
  const [sheetUrl, setSheetUrl] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score?: number;
    feedback?: string;
    details?: Record<string, number>;
    status: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newScreenshots: string[] = [];
    const maxFiles = 5;

    Array.from(files).slice(0, maxFiles - screenshots.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setScreenshots(prev => [...prev, base64].slice(0, maxFiles));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      alert('Je moet ingelogd zijn.');
      return;
    }

    if (!sheetUrl && screenshots.length === 0) {
      alert('Geef een URL op of upload minstens 1 screenshot.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Save to Supabase (without screenshots - too large)
      const { data, error } = await supabase
        .from('opdracht_inzendingen')
        .insert({
          user_email: session.user.email,
          user_name: session.user.name || session.user.email,
          tutorial_id: tutorialId,
          tutorial_slug: tutorialSlug,
          opdracht_titel: opdracht.titel,
          sheet_url: sheetUrl || null,
          status: 'ingediend',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data?.id) {
        throw new Error('No inzendingId returned from database');
      }

      console.log('Inzending opgeslagen:', data.id);

      // Trigger AI correction
      const response = await fetch('/api/opdracht/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inzendingId: data.id,
          sheetUrl: sheetUrl || undefined,
          screenshots: screenshots.length > 0 ? screenshots : undefined,
          criteria: opdracht.criteria,
          maxScore: opdracht.maxScore,
        }),
      });

      const correction = await response.json();
      
      console.log('Correction response:', correction);
      
      if (correction.success) {
        setResult({
          score: correction.score,
          feedback: correction.feedback,
          details: correction.details,
          status: 'voltooid',
        });
      } else {
        setResult({
          status: 'mislukt',
          feedback: correction.error || 'Er ging iets mis bij de correctie.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        status: 'mislukt',
        feedback: 'Er ging iets mis. Probeer opnieuw.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
        📋 {opdracht.titel}
      </h3>
      
      <div className="space-y-4">
        {/* Instructie */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Instructie:</h4>
          <p className="text-gray-600 whitespace-pre-wrap">{opdracht.instructie}</p>
        </div>

        {/* Template Link */}
        {opdracht.templateSheetUrl && (
          <a
            href={opdracht.templateSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            📂 Open Template Sheet
          </a>
        )}

        {/* Criteria */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Beoordelingscriteria:</h4>
          <ul className="space-y-2">
            {opdracht.criteria.map((criterium, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <span className="font-medium">{criterium.naam}</span>
                  {criterium.beschrijving && (
                    <span className="text-gray-500 text-sm ml-2">
                      ({criterium.beschrijving})
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Deadline */}
        {opdracht.deadline && (
          <div className="flex items-center gap-2 text-orange-600">
            ⏰ Deadline: {new Date(opdracht.deadline).toLocaleDateString('nl-BE')}
          </div>
        )}

        {/* Indien Formulier */}
        <div className="bg-white p-4 rounded-lg space-y-4">
          <h4 className="font-semibold text-gray-700">Jouw opdracht indienen:</h4>
          
          {/* Optie 1: URL */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Optie 1: Google Sheet URL
            </label>
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Zorg dat de sheet publiek is: Delen → Iedereen met de link kan bekijken
            </p>
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-200"></div>
            <span>OF</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Optie 2: Screenshots */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Optie 2: Upload screenshots (max 5)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Maak screenshots van elk tabblad (Data, Draaitabel 1, Draaitabel 2, etc.)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading || screenshots.length >= 5}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || screenshots.length >= 5}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>Klik om te uploaden</span>
            </button>

            {/* Preview screenshots */}
            {screenshots.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {screenshots.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Screenshot ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {screenshots.length}/5 screenshots geüpload
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (!sheetUrl && screenshots.length === 0)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Bezig met analyseren...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Indienen & Analyseren</span>
              </>
            )}
          </button>
        </div>

        {/* Resultaat */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.status === 'voltooid' 
              ? 'bg-green-100 border border-green-300' 
              : 'bg-red-100 border border-red-300'
          }`}>
            {result.status === 'voltooid' && result.score !== undefined && (
              <>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  Score: {result.score}/{opdracht.maxScore}
                </div>
                
                {/* Scores per criterium */}
                {result.details && typeof result.details === 'object' && Object.keys(result.details).length > 0 && (
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Scores per criterium:</h4>
                    <div className="space-y-2">
                      {Object.entries(result.details).map(([criterium, score]) => {
                        const numScore = typeof score === 'number' ? score : 0;
                        return (
                          <div key={criterium} className="flex justify-between items-center">
                            <span className="text-gray-600">{criterium}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${numScore * 10}%` }}
                                />
                              </div>
                              <span className="font-medium text-gray-700 w-12 text-right">{numScore}/10</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="text-gray-700">
                  <strong>Feedback:</strong>
                  <p className="mt-1 whitespace-pre-wrap">
                    {typeof result.feedback === 'string' 
                      ? result.feedback 
                      : JSON.stringify(result.feedback, null, 2)}
                  </p>
                </div>
              </>
            )}
            {result.status === 'mislukt' && (
              <div className="text-red-700">
                ❌ {result.feedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
