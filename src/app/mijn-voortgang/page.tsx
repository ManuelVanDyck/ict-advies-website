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
  PlayCircle,
  TrendingUp
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

  // Calculate stats and certificaat status
  Object.entries(groupedData).forEach(([leerpadSlug, leerpad]) => {
    leerpad.voltooid = leerpad.modules.filter(m => m.status === 'voltooid' || m.status === 'gekeurd').length;
    
    const scoresMetScore = leerpad.modules.filter(m => m.score !== undefined);
    if (scoresMetScore.length > 0) {
      leerpad.gemiddeldeScore = Math.round(
        scoresMetScore.reduce((sum, m) => sum + (m.score || 0), 0) / scoresMetScore.length
      );
    }

    if (certificaatStatus && leerpadSlug === 'ai-bewustzijn') {
      leerpad.certificaat = certificaatStatus.allPassed;
    }
  });

  // Ensure all known leerpaden are in the list
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

  const leerpaden = Object.entries(groupedData);
  const totalModules = voortgang.length;
  const totalVoltooid = voortgang.filter(v => v.status === 'voltooid' || v.status === 'gekeurd').length;
  const hasCertificaat = certificaatStatus?.allPassed || false;

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Niet ingelogd</h2>
              <p className="text-gray-600 mb-6">Log in om je voortgang te bekijken.</p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Inloggen
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-brand-green via-green-600 to-green-700 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4" />
                JOUW VOORTGANG
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Mijn voortgang
              </h1>

              <p className="text-white/90 text-base md:text-lg max-w-2xl">
                Bekijk je voortgang per leerpad en haal je certificaten op.
              </p>
            </div>

            {/* Stats in hero */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{totalVoltooid}</div>
                <div className="text-sm text-white/80">Voltooid</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{totalModules}</div>
                <div className="text-sm text-white/80">Inzendingen</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{hasCertificaat ? '✓' : '—'}</div>
                <div className="text-sm text-white/80">Certificaat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificaat highlight */}
      {hasCertificaat && (
        <section className="px-4 -mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-400 rounded-full p-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-900 text-lg">Certificaat behaald!</div>
                    <div className="text-amber-700">AI Bewustzijn — Gemiddelde score: {certificaatStatus?.gemiddeldeScore}%</div>
                  </div>
                </div>
                <a
                  href="/leerpaden/ai-bewustzijn?certificaat=1"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Bekijk certificaat
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leerpaden */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Leerpaden
          </h2>

          {leerpaden.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nog geen opdrachten gestart</h3>
              <p className="text-gray-600 mb-6">Begin aan een leerpad om je voortgang te zien.</p>
              <a
                href="/leerpaden"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Bekijk leerpaden
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {leerpaden.map(([leerpadSlug, leerpad]) => (
                <div key={leerpadSlug} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Leerpad header */}
                  <button
                    onClick={() => toggleLeerpad(leerpadSlug)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {expandedLeerpaden.has(leerpadSlug) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <BookOpen className="w-5 h-5 text-gray-500" />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {LEERPAD_NAMES[leerpadSlug] || leerpadSlug}
                          </span>
                          {leerpad.certificaat && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Award className="w-3 h-3" />
                              Certificaat
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {leerpad.voltooid}/{leerpad.totaal} modules voltooid
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {leerpad.gemiddeldeScore > 0 && (
                        <span className={`text-lg font-bold ${
                          leerpad.gemiddeldeScore >= 70 ? 'text-green-600' :
                          leerpad.gemiddeldeScore >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {leerpad.gemiddeldeScore}%
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Modules (expanded) */}
                  {expandedLeerpaden.has(leerpadSlug) && (
                    <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                      {leerpad.modules.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-gray-500 mb-4">Nog geen modules gestart</p>
                          <a
                            href={`/leerpaden/${leerpadSlug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
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
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-green hover:shadow-sm cursor-pointer transition-all"
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
                                    <span className="text-gray-400">—</span>
                                  )}
                                  <span className={getStatusBadge(module.status)}>
                                    {module.status}
                                  </span>
                                </div>
                              </a>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
