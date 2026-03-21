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
  Eye
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
      const response = await fetch('/api/admin/voortgang');
      const data = await response.json();
      setVoortgang(data.voortgang || []);
    } catch (error) {
      console.error('Error fetching voortgang:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: extract leerpad from tutorial_slug
  const getLeerpadFromSlug = (slug: string): string => {
    // "ai-bewustzijn-module-1" → "ai-bewustzijn"
    // "ander-leerpad-module-2" → "ander-leerpad"
    const match = slug.match(/^(.+)-module-\d+$/);
    return match ? match[1] : slug;
  };

  // Helper: format leerpad name
  const formatLeerpadName = (slug: string): string => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Totaal aantal modules per leerpad
  const LEERPAD_MODULE_COUNT: Record<string, number> = {
    'ai-bewustzijn': 5,
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
    
    // Check of deze module al bestaat (neem hoogste score)
    const existingIndex = groupedData[item.user_email].leerpaden[leerpadSlug].modules.findIndex(
      m => m.tutorial_slug === item.tutorial_slug
    );
    
    if (existingIndex >= 0) {
      // Alleen vervangen als nieuwe score hoger is
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

  // Toggle accordion
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
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
    );
  }

  const userEmail = session?.user?.email || '';
  const hasAdminAccess = userEmail.includes('@classroomatheneum.be');

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
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
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin: Voortgang</h1>
        <p className="text-gray-600">Overzicht per gebruiker en leerpad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-gray-900">{totalGebruikers}</div>
          <div className="text-sm text-gray-600 mt-1">Gebruikers</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">{totalVoltooid}</div>
          <div className="text-sm text-gray-600 mt-1">Modules voltooid</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-brand-orange">{totalInzendingen}</div>
          <div className="text-sm text-gray-600 mt-1">Totaal inzendingen</div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-5 h-5" />
          Exporteer CSV
        </button>
      </div>

      {/* Gebruikers lijst */}
      <div className="space-y-2">
        {gebruikers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            Nog geen voortgang om weer te geven
          </div>
        ) : (
          gebruikers.map((gebruiker) => (
            <div key={gebruiker.email} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Gebruiker header */}
              <button
                onClick={() => toggleUser(gebruiker.email)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedUsers.has(gebruiker.email) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <User className="w-5 h-5 text-gray-500" />
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
                <div className="border-t border-gray-200 bg-gray-50">
                  {Object.entries(gebruiker.leerpaden).map(([leerpadSlug, leerpad]) => {
                    const leerpadKey = `${gebruiker.email}-${leerpadSlug}`;
                    
                    return (
                      <div key={leerpadSlug} className="border-b border-gray-200 last:border-b-0">
                        {/* Leerpad header */}
                        <button
                          onClick={() => toggleLeerpad(leerpadKey)}
                          className="w-full px-6 py-3 pl-14 flex items-center justify-between hover:bg-gray-100 transition-colors"
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
                          <div className="px-6 py-2 pl-20 bg-white">
                            <div className="space-y-2">
                              {leerpad.modules.map((module) => (
                                <div
                                  key={module.id}
                                  onClick={() => setSelectedItem(module)}
                                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-brand-green hover:bg-gray-50 cursor-pointer transition-colors"
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

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Inzending Details</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Naam</span>
                    <p className="font-semibold text-gray-900">{selectedItem.user_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-semibold text-gray-900">{selectedItem.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Opdracht Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Opdracht</span>
                    <p className="font-semibold text-gray-900">{selectedItem.opdracht_titel}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Module</span>
                    <p className="font-semibold text-gray-900">{selectedItem.tutorial_slug}</p>
                  </div>
                </div>
              </div>

              {/* Score & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <span className="text-sm text-gray-500">Score</span>
                  <p className={`text-3xl font-bold ${
                    selectedItem.score !== undefined
                      ? selectedItem.score >= 70 ? 'text-green-600'
                        : selectedItem.score >= 50 ? 'text-yellow-600'
                        : 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {selectedItem.score !== undefined ? `${selectedItem.score}/100` : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
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
                      <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">{key}</h5>
                        <p className="text-gray-700 whitespace-pre-wrap">{value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedItem.feedback && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">AI Feedback</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.feedback}</p>
                  </div>
                </div>
              )}

              {/* Details per criterium */}
              {selectedItem.correctie_data && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Score per criterium</h4>
                  <div className="space-y-4">
                    {Array.isArray(selectedItem.correctie_data) 
                      ? selectedItem.correctie_data.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
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
                              <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{item.feedback}</p>
                            )}
                          </div>
                        ))
                      : Object.entries(selectedItem.correctie_data).map(([key, value]) => (
                          <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800">{key}</span>
                              <span className={`text-lg font-bold ${
                                (typeof value === 'number' ? value : 0) >= 7 ? 'text-green-600'
                                : (typeof value === 'number' ? value : 0) >= 5 ? 'text-yellow-600'
                                : 'text-red-600'
                              }`}>
                                {typeof value === 'number' ? `${value}/10` : '-'}
                              </span>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
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
// Force rebuild za 21 mrt. 2026 22:54:08 CET
