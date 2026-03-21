'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Award, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { generateCertificaatPDF } from '@/lib/pdf/certificaat-pdf';

interface ModuleResult {
  slug: string;
  score: number;
  passed: boolean;
}

interface CertificaatStatus {
  allPassed: boolean;
  modules: ModuleResult[];
  gemiddeldeScore: number;
}

const MODULE_TITELS: Record<string, string> = {
  'ai-bewustzijn-module-1': 'Visievorming – De mens aan het roer',
  'ai-bewustzijn-module-2': 'Betrouwbaarheid toetsen',
  'ai-bewustzijn-module-3': 'Het didactische proces (6 stappen)',
  'ai-bewustzijn-module-4': 'Professionalisering & netwerk',
  'ai-bewustzijn-module-5': 'Google AI Training',
};

export default function CertificaatDownload() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<CertificaatStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchStatus();
    }
  }, [session?.user?.email]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/certificaat/status?user_email=${session?.user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching certificaat status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!status || !session?.user) return;

    const modules = status.modules.map((m) => ({
      titel: MODULE_TITELS[m.slug] || m.slug,
      score: m.score,
    }));

    const blob = generateCertificaatPDF({
      userName: session.user.name || session.user.email || 'Onbekend',
      userEmail: session.user.email || '',
      leerpadTitel: 'AI Bewustzijn',
      modules,
      totaalScore: status.gemiddeldeScore,
      datum: new Date().toLocaleDateString('nl-BE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      directieNaam: 'Nathalie Vanden Bossche',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificaat-ai-bewustzijn-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.allPassed) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              🎉 Gefeliciteerd! Je hebt het leerpad voltooid!
            </h3>
            <p className="text-green-700">
              Je hebt alle modules succesvol afgerond met een score van minimaal 50%.
              Download hier je certificaat.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download certificaat
        </button>
      </div>
    );
  }

  // Niet alle modules voltooid
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <Award className="w-8 h-8 text-gray-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Certificaat
          </h3>
          <p className="text-gray-600 text-sm">
            Voltooi alle modules met minimaal 50% om je certificaat te behalen.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {status.modules.map((module) => (
          <div
            key={module.slug}
            className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
          >
            <div className="flex items-center gap-2">
              {module.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className={`text-sm ${module.passed ? 'text-gray-800' : 'text-gray-500'}`}>
                {MODULE_TITELS[module.slug] || module.slug}
              </span>
            </div>
            <span className={`text-sm font-medium ${module.passed ? 'text-green-600' : 'text-gray-400'}`}>
              {module.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
