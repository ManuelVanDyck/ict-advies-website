'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase/client';
import { Upload, X, Image as ImageIcon, Loader2, Search, FileText } from 'lucide-react';

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
  screenshotOnly?: boolean;
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score?: number;
    feedback?: string;
    details?: Record<string, number>;
    status: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newScreenshots: string[] = [];
    const maxFiles = 5;

    Array.from(files).slice(0, maxFiles).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            setScreenshots(prev => [...prev, base64].slice(0, maxFiles));
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPdfFile(file);
      }
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handlePdfUpload = async (file: File) => {
    if (!session?.user?.email) {
      alert('Je moet ingelogd zijn.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Upload PDF to Supabase Storage
      const fileName = `opdracht-pdf-${Date.now()}-${file.name}`;
      const filePath = `${session.user.email}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('opdracht-pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`PDF upload failed: ${uploadError.message}`);
      }

      // Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from('opdracht-pdfs')
        .getPublicUrl(filePath);

      setPdfUrl(publicUrl);
    } catch (error) {
      console.error('PDF upload error:', error);
      alert(`PDF upload mislukt: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      alert('Je moet ingelogd zijn.');
      return;
    }

    if (!sheetUrl && screenshots.length === 0 && !pdfUrl) {
      alert('Geef een URL op, upload minstens 1 screenshot, of upload een PDF.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('opdracht_inzendingen')
        .insert({
          user_email: session.user.email,
          user_name: session.user.name || session.user.email,
          tutorial_id: tutorialId,
          tutorial_slug: tutorialSlug,
          opdracht_titel: opdracht.titel,
          sheet_url: sheetUrl || null,
          pdf_url: pdfUrl || null,
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
          pdfUrl: pdfUrl || undefined,
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
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-10 overflow-hidden shadow-xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        📋 {opdracht.titel}
      </h3>

      <div className="space-y-4">
        {/* Instructie */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <h4 className="font-semibold text-white mb-2">Instructie:</h4>
          <p className="text-gray-300 whitespace-pre-wrap">{opdracht.instructie}</p>
        </div>

        {/* Template Link */}
        {opdracht.templateSheetUrl && (
          <a
            href={opdracht.templateSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition"
          >
            📂 Open Template Sheet
          </a>
        )}

        {/* Criteria */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <h4 className="font-semibold text-white mb-3">Beoordelingscriteria:</h4>
          <ul className="space-y-2">
            {opdracht.criteria.map((criterium, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-brand-orange font-bold">✓</span>
                <div>
                  <span className="font-medium text-white">{criterium.naam}</span>
                  {criterium.beschrijving && (
                    <span className="text-gray-400 text-sm ml-2">
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
          <div className="flex items-center gap-2 text-brand-orange font-medium">
            ⏰ Deadline: {new Date(opdracht.deadline).toLocaleDateString('nl-BE')}
          </div>
        )}

        {/* Indien Formulier */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 space-y-4">
          <h4 className="font-semibold text-white">Jouw opdracht indienen:</h4>

          {/* Screenshot Only Mode */}
          {opdracht.screenshotOnly ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Upload screenshot
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-white/30 rounded-lg hover:border-brand-orange hover:bg-white/10 transition disabled:opacity-50 text-white"
                >
                  <Upload className="w-5 h-5" />
                  <span>Klik om screenshot te uploaden</span>
                </button>

                {/* Preview screenshot */}
                {screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {screenshots.map((src, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={src}
                          alt={`Screenshot ${index + 1}`}
                          className="w-32 h-32 object-cover rounded-lg border border-white/20"
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
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || screenshots.length === 0}
                className="w-full px-6 py-3 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </>
          ) : (
            <>
              {/* Full Mode: URL + Screenshots + PDF */}
              {/* Optie 1: URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Optie 1: Google Sheet URL
                </label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Zorg dat de sheet publiek is: Delen → Iedereen met de link kan bekijken
                </p>
              </div>

              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex-1 border-t border-white/10"></div>
                <span>OF</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Optie 2: Screenshots */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Optie 2: Upload screenshots (max 5)
                </label>
                <p className="text-xs text-gray-400 mb-1">
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
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-white/30 rounded-lg hover:border-brand-orange hover:bg-white/10 transition disabled:opacity-50 text-white"
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
                          className="w-24 h-24 object-cover rounded-lg border border-white/20"
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

                <p className="text-xs text-gray-400 mt-2">
                  {screenshots.length}/5 screenshots geüpload
                </p>
              </div>

              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex-1 border-t border-white/10"></div>
                <span>OF</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Optie 3: PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Optie 3: Upload PDF (opent in nieuw tabblad)
                </label>
                <p className="text-xs text-gray-400 mb-1">
                  Upload je uitgewerkte opdracht. De PDF opent automatisch in een nieuw tabblad.
                </p>

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdfFile(file);
                      handlePdfUpload(file);
                    }
                  }}
                  className="hidden"
                  disabled={loading || !!pdfUrl}
                />

                <button
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={loading || !!pdfUrl}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-white/30 rounded-lg hover:border-brand-green hover:bg-white/10 transition disabled:opacity-50 text-white w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Bezig met uploaden...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>
                        {pdfUrl ? 'PDF geüpload ✓' : 'Klik om PDF te uploaden'}
                      </span>
                    </>
                  )}
                </button>

                {pdfUrl && (
                  <div className="mt-3 p-3 bg-white/10 rounded-lg">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-brand-orange hover:text-brand-orange/80 underline transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>PDF in nieuw tabblad bekijken</span>
                      <X className="w-4 h-4 ml-4" />
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || (!sheetUrl && screenshots.length === 0 && !pdfUrl)}
                className="w-full px-6 py-3 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </>
          )}
        </div>

        {/* Resultaat */}
        {result && (
          <div className={`p-4 rounded-xl ${
            result.status === 'voltooid'
              ? 'bg-green-500/20 border border-brand-green'
              : 'bg-red-500/20 border border-red-400'
          }`}>
            {result.status === 'voltooid' && result.score !== undefined && (
              <>
                <div className="text-3xl font-bold text-brand-orange mb-2">
                  Score: {result.score}/{opdracht.maxScore}
                </div>

                {/* Scores per criterium */}
                {result.details && typeof result.details === 'object' && Object.keys(result.details).length > 0 && (
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-white mb-3">Scores per criterium:</h4>
                    <div className="space-y-3">
                      {Object.entries(result.details).map(([criterium, score]) => {
                        const numScore = typeof score === 'number' ? score : 0;
                        // Score kan 0-10 of 0-100 zijn, normaliseer naar 0-100
                        const normalizedScore = numScore > 10 ? numScore : numScore * 10;
                        return (
                          <div key={criterium}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-300">{criterium}</span>
                              <span className="font-medium text-white">{normalizedScore}/100</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  normalizedScore >= 70 ? 'bg-green-500' :
                                  normalizedScore >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${normalizedScore}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="text-white">
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
              <div className="text-red-300">
                ❌ {result.feedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
