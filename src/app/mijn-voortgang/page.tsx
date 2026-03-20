'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Clock, PlayCircle, Download, AlertCircle } from 'lucide-react';

interface OpdrachtVoortgang {
  id: string;
  tutorial_slug: string;
  opdracht_titel: string;
  score?: number;
  feedback?: string;
  status: 'niet_begonnen' | 'bezig' | 'ingediend' | 'gekeurd' | 'voltooid';
  completed_at?: string;
}

export default function MijnVoortgangPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [voortgang, setVoortgang] = useState<OpdrachtVoortgang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchVoortgang();
    }
  }, [session]);

  const fetchVoortgang = async () => {
    try {
      const response = await fetch(`/api/opdracht/voortgang?user_email=${session?.user?.email}`);
      const data = await response.json();
      setVoortgang(data.voortgang || []);
    } catch (error) {
      console.error('Error fetching voortgang:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'voltooid':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'bezig':
      case 'ingediend':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <PlayCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'voltooid':
        return 'Voltooid';
      case 'bezig':
        return 'Bezig';
      case 'ingediend':
        return 'Ingediend';
      case 'gekeurd':
        return 'Gekeurd';
      default:
        return 'Niet begonnen';
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ';
    switch (status) {
      case 'voltooid':
        return base + 'bg-green-100 text-green-700';
      case 'bezig':
      case 'ingediend':
        return base + 'bg-yellow-100 text-yellow-700';
      case 'gekeurd':
        return base + 'bg-blue-100 text-blue-700';
      default:
        return base + 'bg-gray-100 text-gray-600';
    }
  };

  // Calculate progress
  const voltooidCount = voortgang.filter(v => v.status === 'voltooid').length;
  const totalCount = voortgang.length > 0 ? voortgang.length : 4; // Aantal unieke tutorials, fallback naar 4
  const progress = totalCount > 0 ? (voltooidCount / totalCount) * 100 : 0;

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
          <p className="text-yellow-700">Log in om je voortgang te bekijken.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mijn Voortgang</h1>
        <p className="text-gray-600">Bekijk en beheer je voortgang in het AI Bewustzijn leerpad.</p>
      </div>

      {/* Progress overview */}
      <div className="bg-gradient-to-br from-brand-green to-green-600 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Jouw Voortgang</h2>
            <p className="text-white/90">{totalCount} {totalCount === 1 ? 'opdracht' : 'opdrachten'}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{Math.round(progress)}%</div>
            <p className="text-white/90 text-sm">Voltooid</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-sm text-white/90">
          {voltooidCount} van {totalCount} {totalCount === 1 ? 'opdracht' : 'opdrachten'} voltooid
        </div>
      </div>

      {/* Opdrachten lijst */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Opdrachten</h3>

        {voortgang.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Je hebt nog geen opdrachten gestart.</p>
            <a
              href="/tutorials"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Bekijk tutorials
            </a>
          </div>
        ) : (
          voortgang.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.opdracht_titel}</h4>
                    <p className="text-sm text-gray-600">{item.tutorial_slug}</p>
                  </div>
                </div>
                <div className={getStatusBadge(item.status)}>
                  {getStatusText(item.status)}
                </div>
              </div>

              {item.status === 'voltooid' && item.score !== undefined && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Score:</span>
                      <span className={`font-bold text-lg ${
                        item.score >= 70 ? 'text-green-600' :
                        item.score >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.score}/100
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.completed_at
                        ? new Date(item.completed_at).toLocaleDateString('nl-BE')
                        : 'Recent'
                      }
                    </span>
                  </div>

                  {item.feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{item.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {item.status === 'voltooid' && (
                  <a
                    href={`/api/opdracht/pdf?id=${item.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
