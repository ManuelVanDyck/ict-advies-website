import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeerpadBySlug, getLeerpaden } from '@/sanity/queries';
import { Clock, CheckCircle, ArrowRight, ArrowLeft, BookOpen, Target, Lightbulb } from 'lucide-react';

// Force dynamic rendering in development for instant updates
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const leerpaden = await getLeerpaden();
  return leerpaden.map((leerpad: any) => ({
    slug: leerpad.slug?.current || '',
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const leerpad = await getLeerpadBySlug(slug);
  if (!leerpad) return { title: 'Leerpad niet gevonden' };
  return {
    title: `${leerpad.titel} | ICT-Advies`,
    description: leerpad.doelgroep,
  };
}

const profielEmojis: Record<string, string> = {
  starter: '🌱',
  integrator: '🔍',
  expert: '🔧',
  leader: '🚀',
  'ai-verplicht': '🤖',
};

const profielNamen: Record<string, string> = {
  starter: 'Digitale basis (A1→A2)',
  integrator: 'Digitale integratie (A2→B1)',
  expert: 'Digitale verdieping (B1→B2)',
  leader: 'Digitale innovatie (B2+)',
  'ai-verplicht': 'AI bewustzijn (verplicht)',
};

export default async function LeerpadDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const leerpad = await getLeerpadBySlug(slug);

  if (!leerpad) {
    notFound();
  }

  const leerpadSlug = leerpad.slug?.current || slug;

  return (
    <div className="min-h-screen bg-[#fee4cc]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#4c8077] to-[#3a6b63] text-white py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm opacity-80 mb-4">
            <Link href="/leerpaden" className="hover:underline">
              Leerpaden
            </Link>
            <span>/</span>
            <span>{leerpad.titel}</span>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-5xl">{profielEmojis[leerpad.profiel] || '📚'}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{leerpad.titel}</h1>
              <p className="text-lg opacity-90">{profielNamen[leerpad.profiel] || leerpad.doelgroep}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{leerpad.totaleDuur} uur</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>{leerpad.modules?.length || 0} modules</span>
            </div>
            {leerpad.certificaat && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Certificaat beschikbaar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Intro */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-[#4c8077] mb-4">
                Over dit leerpad
              </h2>
              <p className="text-gray-600 mb-4">{leerpad.doelgroep}</p>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-[#4c8077] mb-6">
                Modules
              </h2>
              {leerpad.modules && leerpad.modules.length > 0 ? (
                <div className="space-y-4">
                  {leerpad.modules.map((module: any, index: number) => {
                    const moduleSlug = module.slug?.current || `module-${index + 1}`;
                    return (
                      <Link
                        key={module._id || index}
                        href={`/leerpaden/${leerpadSlug}/${moduleSlug}`}
                        className="block border-2 border-gray-200 rounded-lg p-4 hover:border-[#e53013] transition-colors group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-[#4c8077] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg group-hover:text-[#e53013] transition-colors">
                              {module.titel}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {module.beschrijving}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{module.duur} min</span>
                              </div>
                              {module.aiStap && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  AI Stap {module.aiStap}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#e53013] transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">Nog geen modules beschikbaar.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start button */}
            {leerpad.modules && leerpad.modules.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <Link
                  href={`/leerpaden/${leerpadSlug}/${leerpad.modules[0].slug?.current || 'module-1'}`}
                  className="block w-full bg-[#e53013] text-white text-center py-3 rounded-lg font-semibold hover:bg-[#c42a10] transition-colors"
                >
                  Start leerpad
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </Link>
              </div>
            )}

            {/* Doelstellingen */}
            {leerpad.doelstellingen && leerpad.doelstellingen.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-[#4c8077] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Wat leer je?
                </h3>
                <ul className="space-y-2">
                  {leerpad.doelstellingen.map((doel: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{doel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Voorwaarden */}
            {leerpad.voorwaarden && leerpad.voorwaarden.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-[#4c8077] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Voorkennis
                </h3>
                <ul className="space-y-2">
                  {leerpad.voorwaarden.map((voorwaarde: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400">•</span>
                      <span>{voorwaarde}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Back link */}
            <Link
              href="/leerpaden"
              className="flex items-center gap-2 text-[#4c8077] hover:text-[#3a6b63] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Alle leerpaden</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
