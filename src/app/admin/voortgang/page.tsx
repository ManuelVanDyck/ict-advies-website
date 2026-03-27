'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ChevronRight, 
  ChevronDown,
  User,
  BookOpen,
  Eye,
  Award,
  Users,
  BarChart3
} from 'lucide-react';

interface OpdrachtVoortgang {
  id: string;
  user_name: string;
  user_email: string;
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
}

interface GebruikerData {
  name: string;
  email: string;
  leerpaden: Record<string, LeerpadData>;
}

export default function AdminVoortgangPage() {
  const { data: session, status } = useSession();
  const [voortgang, setVoortgang] = useState<OpdrachtVoortgang[]>([]);
  const [certificaten, setCertificaten] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OpdrachtVoortgang | null>(null);
  
  // Accordion state
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedLeerpaden, setExpandedLeerpaden] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'authenticated') {
      const userEmail = session?.user?.email || '';
      const hasAdminAccess = userEmail.includes('@classroomatheneum.be');

      if (!hasAdminAccess) {
        window.location.href = '/';
        return;
      }

      fetchVoortgang();
    }
  }, [status, session]);

  const fetchVoortgang = async () => {
    try {
      const response = await fetch(`/api/admin/voortgang?t=${Date.now()}`);
      const data = await response.json();
      setVoortgang(data.voortgang || []);
      setCertificaten(data.certificaten || {});
    } catch (error) {
      console.error('Error fetching voortgang:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeerpadFromSlug = (slug: string): string => {
    const match = slug.match(/^(.+)-module-\d+$/);
    return match ? match[1] : slug;
  };

  const formatLeerpadName = (slug: string): string => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const LEERPAD_MODULE_COUNT: Record<string, number> = {
    'ai-bewustzijn': 6,
  };

  // Group data by user, then by leerpad
  const groupedData: Record<string, GebruikerData> = {};
  
  voortgang.forEach((item) => {
    const leerpadSlug = getLeerpadFromSlug(item.tutorial_slug);
    
    if (!groupedData[item.user_email]) {
      groupedData[item.user_email] = {
        name: item.user_name,
        email: item.user_email,
        leerpaden: {}
      };
    }
    
    if (!groupedData[item.user_email].leerpaden[leerpadSlug]) {
      groupedData[item.user_email].leerpaden[leerpadSlug] = {
        modules: [],
        gemiddeldeScore: 0,
        voltooid: 0,
        totaal: LEERPAD_MODULE_COUNT[leerpadSlug] || 0
      };
    }
    
    const existingIndex = groupedData[item.user_email].leerpaden[leerpadSlug].modules.findIndex(
      m => m.tutorial_slug === item.tutorial_slug
    );
    
    if (existingIndex >= 0) {
      const existing = groupedData[item.user_email].leerpaden[leerpadSlug].modules[existingIndex];
      if ((item.score || 0) > (existing.score || 0)) {
        groupedData[item.user_email].leerpaden[leerpadSlug].modules[existingIndex] = item;
      }
    } else {
      groupedData[item.user_email].leerpaden[leerpadSlug].modules.push(item);
    }
  });

  // Calculate stats per leerpad
  Object.values(groupedData).forEach(gebruiker => {
    Object.values(gebruiker.leerpaden).forEach(leerpad => {
      leerpad.voltooid = leerpad.modules.filter(m => m.status === 'voltooid' || m.status === 'gekeurd').length;
      
      const scoresMetScore = leerpad.modules.filter(m => m.score !== undefined);
      if (scoresMetScore.length > 0) {
        leerpad.gemiddeldeScore = Math.round(
          scoresMetScore.reduce((sum, m) => sum + (m.score || 0), 0) / scoresMetScore.length
        );
      }
    });
  });

  const toggleUser = (email: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedUsers(newExpanded);
  };

  const toggleLeerpad = (key: string) => {
    const newExpanded = new Set(expandedLeerpaden);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedLeerpaden(newExpanded);
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/voortgang', {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voortgang-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Er ging iets mis bij het exporteren.');
    }
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
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Global stats
  const gebruikers = Object.values(groupedData);
  const totalGebruikers = gebruikers.length;
  const totalInzendingen = voortgang.length;
  const totalVoltooid = voortgang.filter(v => v.status === 'voltooid' || v.status === 'gekeurd').length;
  
  // Count total certificates
  const totalCertificaten = Object.values(certificaten).reduce((sum, userCerts) => {
    return sum + Object.values(userCerts).filter(Boolean).length;
  }, 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Niet ingelogd</h2>
              <p className="text-gray-600 mb-6">Je moet ingelogd zijn om toegang te krijgen.</p>
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

  const userEmail = session?.user?.email || '';
  const hasAdminAccess = userEmail.includes('@classroomatheneum.be');

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Geen toegang</h2>
              <p className="text-gray-600 mb-6">Je hebt geen toegang tot de admin pagina.</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Terug naar home
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
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <BarChart3 className="w-4 h-4" />
                ADMIN
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Voortgang overzicht
              </h1>

              <p className="text-gray-300 text-base md:text-lg max-w-2xl">
                Bekijk de voortgang van alle gebruikers en beheer certificaten.
              </p>
            </div>

            {/* Stats in hero */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{totalGebruikers}</div>
                <div className="text-sm text-white/80">Gebruikers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{totalVoltooid}</div>
                <div className="text-sm text-white/80">Voltooid</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">{totalInzendingen}</div>
                <div className="text-sm text-white/80">Inzendingen</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-brand-orange">{totalCertificaten}</div>
                <div className="text-sm text-white/80">Certificaten</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export & Content */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Export button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exporteer CSV
            </button>
          </div>

          {/* Gebruikers lijst */}
          <div className="space-y-4">
            {gebruikers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-gray-500">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nog geen voortgang</h3>
                <p>Er zijn nog geen inzendingen om weer te geven.</p>
              </div>
            ) : (
              gebruikers.map((gebruiker) => (
                <div key={gebruiker.email} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Gebruiker header */}
                  <button
                    onClick={() => toggleUser(gebruiker.email)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {expandedUsers.has(gebruiker.email) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="bg-gray-100 rounded-full p-2.5">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">{gebruiker.name}</div>
                        <div className="text-sm text-gray-500">{gebruiker.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{Object.keys(gebruiker.leerpaden).length} leerpaden</span>
                    </div>
                  </button>

                  {/* Leerpaden (expanded) */}
                  {expandedUsers.has(gebruiker.email) && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                      {Object.entries(gebruiker.leerpaden).map(([leerpadSlug, leerpad]) => {
                        const leerpadKey = `${gebruiker.email}-${leerpadSlug}`;
                        
                        return (
                          <div key={leerpadSlug} className="border-b border-gray-100 last:border-b-0">
                            {/* Leerpad header */}
                            <button
                              onClick={() => toggleLeerpad(leerpadKey)}
                              className="w-full px-6 py-4 pl-16 flex items-center justify-between hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {expandedLeerpaden.has(leerpadKey) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-800">
                                  {formatLeerpadName(leerpadSlug)}
                                </span>
                                {certificaten[gebruiker.email]?.[leerpadSlug] && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    <Award className="w-3 h-3" />
                                    Certificaat
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500">
                                  {leerpad.voltooid}/{leerpad.totaal} modules
                                </span>
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
                            {expandedLeerpaden.has(leerpadKey) && (
                              <div className="px-6 py-3 pl-24 bg-white">
                                <div className="space-y-2">
                                  {leerpad.modules
                                    .sort((a, b) => {
                                      const numA = parseInt(a.tutorial_slug.match(/module-(\d+)/)?.[1] || '0');
                                      const numB = parseInt(b.tutorial_slug.match(/module-(\d+)/)?.[1] || '0');
                                      return numA - numB;
                                    })
                                    .map((module) => (
                                      <div
                                        key={module.id}
                                        onClick={() => setSelectedItem(module)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-brand-green hover:shadow-sm cursor-pointer transition-all"
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
                                          <Eye className="w-4 h-4 text-gray-400" />
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Inzending Details</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Naam</span>
                    <p className="font-semibold text-gray-900 mt-1">{selectedItem.user_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-semibold text-gray-900 mt-1">{selectedItem.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Opdracht Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Opdracht</span>
                    <p className="font-semibold text-gray-900 mt-1">{selectedItem.opdracht_titel}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Module</span>
                    <p className="font-semibold text-gray-900 mt-1">{selectedItem.tutorial_slug}</p>
                  </div>
                </div>
              </div>

              {/* Score & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <span className="text-sm text-gray-500">Score</span>
                  <p className={`text-3xl font-bold mt-2 ${
                    selectedItem.score !== undefined
                      ? selectedItem.score >= 70 ? 'text-green-600'
                        : selectedItem.score >= 50 ? 'text-yellow-600'
                        : 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {selectedItem.score !== undefined ? `${selectedItem.score}/100` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {getStatusIcon(selectedItem.status)}
                    <span className={getStatusBadge(selectedItem.status)}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Antwoorden */}
              {selectedItem.antwoorden && Object.keys(selectedItem.antwoorden).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Antwoorden</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedItem.antwoorden).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-xl p-4">
                        <h5 className="font-medium text-gray-800 mb-2">{key}</h5>
                        <p className="text-gray-700 whitespace-pre-wrap">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedItem.feedback && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">AI Feedback</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.feedback}</p>
                  </div>
                </div>
              )}

              {/* Details per criterium */}
              {selectedItem.correctie_data && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Score per criterium</h4>
                  <div className="space-y-3">
                    {Array.isArray(selectedItem.correctie_data) 
                      ? selectedItem.correctie_data.map((item: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800">{item.criterium || `Criterium ${idx + 1}`}</span>
                              <span className={`text-lg font-bold ${
                                (item.score || 0) >= 70 ? 'text-green-600'
                                : (item.score || 0) >= 50 ? 'text-yellow-600'
                                : 'text-red-600'
                              }`}>
                                {item.score || 0}/100
                              </span>
                            </div>
                            {item.feedback && (
                              <p className="text-sm text-gray-600 bg-white rounded-lg p-3 mt-2">{item.feedback}</p>
                            )}
                          </div>
                        ))
                      : Object.entries(selectedItem.correctie_data).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{key}</span>
                              <span className={`text-lg font-bold ${
                                (typeof value === 'number' ? value : 0) >= 7 ? 'text-green-600'
                                : (typeof value === 'number' ? value : 0) >= 5 ? 'text-yellow-600'
                                : 'text-red-600'
                              }`}>
                                {typeof value === 'number' ? `${value}/10` : '—'}
                              </span>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-100">
                <p>Aangemaakt: {new Date(selectedItem.created_at).toLocaleString('nl-BE', { 
                  dateStyle: 'short', 
                  timeStyle: 'short' 
                })}</p>
                {selectedItem.completed_at && (
                  <p>Voltooid: {new Date(selectedItem.completed_at).toLocaleString('nl-BE', { 
                    dateStyle: 'short', 
                    timeStyle: 'short' 
                  })}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
