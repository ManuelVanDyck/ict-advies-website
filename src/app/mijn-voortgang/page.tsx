'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  BookOpen,
  Award,
  PlayCircle
} from 'lucide-react';

interface OpdrachtVoortgang {
  id: string;
  tutorial_slug: string;
  opdracht_titel: string;
  antwoorden?: Record<string, string>;
  score?: number;
  feedback?: string;
  correctie_data?: Record<string, number>;
  status: 'niet_begonnen' | 'bezig' | 'ingediend' | 'gekeurd' | 'voltooid';
  created_at: string;
  completed_at?: string;
}

interface LeerpadData {
  modules: OpdrachtVoortgang[];
  gemiddeldeScore: number;
  voltooid: number;
  totaal: number;
  certificaat: boolean;
}

interface CertificaatStatus {
  allPassed: boolean;
  modules: Array<{ slug: string; score: number; passed: boolean }>;
  gemiddeldeScore: number;
}

const LEERPAD_MODULE_COUNT: Record<string, number> = {
  'ai-bewustzijn': 5,
};

const LEERPAD_NAMES: Record<string, string> = {
  'ai-bewustzijn': 'AI Bewustzijn',
};

export default function MijnVoortgangPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [voortgang, setVoortgang] = useState<OpdrachtVoortgang[]>([]);
  const [certificaatStatus, setCertificaatStatus] = useState<CertificaatStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Accordion state
  const [expandedLeerpaden, setExpandedLeerpaden] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user?.email) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const userEmail = session?.user?.email;
      
      // Haal voortgang en certificaat status parallel op
      const [voortgangRes, certificaatRes] = await Promise.all([
        fetch(`/api/opdracht/voortgang?user_email=${userEmail}`),
        fetch(`/api/certificaat/status?user_email=${userEmail}`),
      ]);

      const voortgangData = await voortgangRes.json();
      const certificaatData = await certificaatRes.json();
      
      setVoortgang(voortgangData.voortgang || []);
      setCertificaatStatus(certificaatData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: extract leerpad from tutorial_slug
  const getLeerpadFromSlug = (slug: string): string => {
    const match = slug.match(/^(.+)-module-\d+$/);
    return match ? match[1] : slug;
  };

  // Group data by leerpad
  const groupedData: Record<string, LeerpadData> = {};
  
  voortgang.forEach((item) => {
    const leerpadSlug = getLeerpadFromSlug(item.tutorial_slug);
    
    if (!groupedData[leerpadSlug]) {
      groupedData[leerpadSlug] = {
        modules: [],
        gemiddeldeScore: 0,
        voltooid: 0,
        totaal: LEERPAD_MODULE_COUNT[leerpadSlug] || 0,
        certificaat: false,
      };
    }
    
    // Check of deze module al bestaat (neem hoogste score)
    const existingIndex = groupedData[leerpadSlug].modules.findIndex(
      m => m.tutorial_slug === item.tutorial_slug
    );
    
    if (existingIndex >= 0) {
      const existing = groupedData[leerpadSlug].modules[existingIndex];
      if ((item.score || 0) > (existing.score || 0)) {
        groupedData[leerpadSlug].modules[existingIndex] = item;
      }
    } else {
      groupedData[leerpadSlug].modules.push(item);
    }
  });

  // Calculate stats per leerpad en voeg certificaat status toe
  Object.entries(groupedData).forEach(([leerpadSlug, leerpad]) => {
    leerpad.voltooid = leerpad.modules.filter(m => m.status === 'voltooid' || m.status === 'gekeurd').length;
    
    const scoresMetScore = leerpad.modules.filter(m => m.score !== undefined);
    if (scoresMetScore.length > 0) {
      leerpad.gemiddeldeScore = Math.round(
        scoresMetScore.reduce((sum, m) => sum + (m.score || 0), 0) / scoresMetScore.length
      );
    }

    // Certificaat status uit API
    if (certificaatStatus && leerpadSlug === 'ai-bewustzijn') {
      leerpad.certificaat = certificaatStatus.allPassed;
    }
  });

  // Zorg dat alle bekende leerpaden in de lijst staan (ook als er nog geen voortgang is)
  Object.keys(LEERPAD_MODULE_COUNT).forEach((leerpadSlug) => {
    if (!groupedData[leerpadSlug]) {
      groupedData[leerpadSlug] = {
        modules: [],
        gemiddeldeScore: 0,
        voltooid: 0,
        totaal: LEERPAD_MODULE_COUNT[leerpadSlug],
        certificaat: false,
      };
    }
  });

  // Toggle accordion
  const toggleLeerpad = (slug: string) => {
    const newExpanded = new Set(expandedLeerpaden);
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
    }
    setExpandedLeerpaden(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ';
    switch (status) {
      case 'voltooid':
      case 'gekeurd':
        return base + 'bg-green-100 text-green-700';
      case 'bezig':
      case 'ingediend':
        return base + 'bg-yellow-100 text-yellow-700';
      default:
        return base + 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'voltooid':
      case 'gekeurd':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'bezig':
      case 'ingediend':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <PlayCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Global stats
  const leerpaden = Object.entries(groupedData);
  const totalModules = voortgang.length;
  const totalVoltooid = voortgang.filter(v => v.status === 'voltooid' || v.status === 'gekeurd').length;
  const hasCertificaat = certificaatStatus?.allPassed || false;

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Niet ingelogd</h2>
          <p className="text-yellow-700 mb-4">Log in om je voortgang te bekijken.</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Inloggen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mijn voortgang</h1>
        <p className="text-gray-600">Bekijk je voortgang per leerpad.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">{totalVoltooid}</div>
          <div className="text-sm text-gray-600 mt-1">Modules voltooid</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-brand-orange">{totalModules}</div>
          <div className="text-sm text-gray-600 mt-1">Inzendingen</div>
        </div>
        {hasCertificaat && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-lg font-bold text-amber-800">Certificaat behaald!</div>
                <div className="text-sm text-amber-600">AI Bewustzijn</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leerpaden lijst */}
      <div className="space-y-2">
        {leerpaden.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Je hebt nog geen opdrachten gestart.</p>
            <a
              href="/leerpaden"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Bekijk leerpaden
            </a>
          </div>
        ) : (
          leerpaden.map(([leerpadSlug, leerpad]) => (
            <div key={leerpadSlug} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Leerpad header */}
              <button
                onClick={() => toggleLeerpad(leerpadSlug)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedLeerpaden.has(leerpadSlug) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {LEERPAD_NAMES[leerpadSlug] || leerpadSlug}
                  </span>
                  {/* Certificaat badge */}
                  {leerpad.certificaat && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <Award className="w-3 h-3" />
                      Certificaat
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{leerpad.voltooid}/{leerpad.totaal} modules</span>
                  {leerpad.gemiddeldeScore > 0 && (
                    <span className={`font-medium ${
                      leerpad.gemiddeldeScore >= 70 ? 'text-green-600' :
                      leerpad.gemiddeldeScore >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {leerpad.gemiddeldeScore}% gem.
                    </span>
                  )}
                </div>
              </button>

              {/* Modules (expanded) */}
              {expandedLeerpaden.has(leerpadSlug) && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  {leerpad.modules.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <p>Nog geen modules gestart</p>
                      <a
                        href={`/leerpaden/${leerpadSlug}`}
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Start leerpad
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leerpad.modules
                        .sort((a, b) => {
                          const numA = parseInt(a.tutorial_slug.match(/module-(\d+)/)?.[1] || '0');
                          const numB = parseInt(b.tutorial_slug.match(/module-(\d+)/)?.[1] || '0');
                          return numA - numB;
                        })
                        .map((module) => (
                          <a
                            key={module.id}
                            href={`/leerpaden/${leerpadSlug}/${module.tutorial_slug}`}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-brand-green hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(module.status)}
                              <div>
                                <div className="font-medium text-gray-800">
                                  {module.opdracht_titel}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(module.created_at).toLocaleDateString('nl-BE')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {module.score !== undefined ? (
                                <span className={`font-bold ${
                                  module.score >= 70 ? 'text-green-600' :
                                  module.score >= 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {module.score}/100
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                              <span className={getStatusBadge(module.status)}>
                                {module.status}
                              </span>
                            </div>
                          </a>
                        ))}
                      
                      {/* Certificaat download link */}
                      {leerpad.certificaat && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Award className="w-6 h-6 text-amber-600" />
                              <div>
                                <div className="font-semibold text-amber-800">Certificaat behaald!</div>
                                <div className="text-sm text-amber-600">
                                  Gemiddelde score: {certificaatStatus?.gemiddeldeScore}%
                                </div>
                              </div>
                            </div>
                            <a
                              href="/leerpaden/ai-bewustzijn?certificaat=1"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                            >
                              <Award className="w-4 h-4" />
                              Bekijk certificaat
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
