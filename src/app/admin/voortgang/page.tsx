'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OpdrachtVoortgang {
  id: string;
  user_name: string;
  user_email: string;
  tutorial_slug: string;
  opdracht_titel: string;
  score?: number;
  feedback?: string;
  status: 'niet_begonnen' | 'bezig' | 'ingediend' | 'gekeurd' | 'voltooid';
  created_at: string;
  completed_at?: string;
}

export default function AdminVoortgangPage() {
  const { data: session, status } = useSession();
  const [voortgang, setVoortgang] = useState<OpdrachtVoortgang[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

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
      const url = filter === 'all'
        ? '/api/admin/voortgang'
        : `/api/admin/voortgang?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();
      setVoortgang(data.voortgang || []);
    } catch (error) {
      console.error('Error fetching voortgang:', error);
    } finally {
      setLoading(false);
    }
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
    const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ';
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

  // Stats
  const total = voortgang.length;
  const voltooid = voortgang.filter((v) => v.status === 'voltooid').length;
  const bezig = voortgang.filter((v) => v.status === 'bezig' || v.status === 'ingediend').length;
  const avgScore = voltooid > 0
    ? Math.round(voortgang.reduce((sum, v) => sum + (v.score || 0), 0) / voltooid)
    : 0;

  if (status === 'loading') {
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
          <p className="text-gray-600 mb-6">
            Je hebt geen toegang tot de admin pagina.
          </p>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin: Voortgang Overzicht</h1>
        <p className="text-gray-600">Beheer en analyseer de voortgang van alle leerkrachten.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-600 mt-1">Totaal inzendingen</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600">{voltooid}</div>
          <div className="text-sm text-gray-600 mt-1">Voltooid</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-yellow-600">{bezig}</div>
          <div className="text-sm text-gray-600 mt-1">In uitvoering</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-brand-orange">{avgScore}</div>
          <div className="text-sm text-gray-600 mt-1">Gemiddelde score</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          >
            <option value="all">Alle statussen</option>
            <option value="voltooid">Voltooid</option>
            <option value="bezig">Bezig</option>
            <option value="ingediend">Ingediend</option>
            <option value="gekeurd">Gekeurd</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-5 h-5" />
          Exporteer CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opdracht
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {voortgang.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.user_name}</div>
                      <div className="text-sm text-gray-500">{item.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.opdracht_titel}</div>
                      <div className="text-sm text-gray-500">{item.tutorial_slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.score !== undefined ? (
                      <span className={`font-bold ${
                        item.score >= 70 ? 'text-green-600' :
                        item.score >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.score}/100
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={getStatusBadge(item.status)}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('nl-BE')}
                  </td>
                </tr>
              ))}
              {voortgang.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Geen resultaten gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
