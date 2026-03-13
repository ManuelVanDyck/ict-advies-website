import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getModuleBySlug } from '@/sanity/queries';
import { Clock, ArrowRight, ArrowLeft, BookOpen, Video, ExternalLink, CheckCircle } from 'lucide-react';

// Force dynamic rendering in development for instant updates
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; module: string }> }): Promise<Metadata> {
  const { slug, module } = await params;
  const moduleData = await getModuleBySlug(slug, module);
  if (!moduleData) return { title: 'Module niet gevonden' };
  return {
    title: `${moduleData.titel} | ${moduleData.leerpad?.titel} | ICT-Advies`,
    description: moduleData.beschrijving,
  };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string; module: string }> }) {
  const { slug, module: moduleSlug } = await params;
  const moduleData = await getModuleBySlug(slug, moduleSlug);

  if (!moduleData) {
    notFound();
  }

  const leerpad = moduleData.leerpad;
  const vorige = moduleData.vorigeModule;
  const volgende = moduleData.volgendeModule;

  return (
    <div className="min-h-screen bg-[#fee4cc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4c8077] to-[#3a6b63] text-white py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm opacity-80 mb-4">
            <Link href="/leerpaden" className="hover:underline">
              Leerpaden
            </Link>
            <span>/</span>
            <Link href={`/leerpaden/${leerpad?.slug.current}`} className="hover:underline">
              {leerpad?.titel}
            </Link>
            <span>/</span>
            <span>{moduleData.titel}</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{moduleData.titel}</h1>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{moduleData.duur} minuten</span>
            </div>
            {moduleData.aiStap && (
              <span>AI Stap {moduleData.aiStap}</span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            {moduleData.videoUrl && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <a
                    href={moduleData.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#e53013] text-white px-6 py-3 rounded-lg hover:bg-[#c42a10] transition-colors"
                  >
                    <Video className="w-5 h-5" />
                    Bekijk video
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Beschrijving */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-[#4c8077] mb-4">
                Beschrijving
              </h2>
              <p className="text-gray-700">{moduleData.beschrijving}</p>
            </div>

            {/* Praktijkopdracht */}
            {moduleData.praktijkopdracht && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Praktijkopdracht
                </h3>
                <p className="text-gray-700">{moduleData.praktijkopdracht}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              {vorige ? (
                <Link
                  href={`/leerpaden/${slug}/${vorige.slug.current}`}
                  className="flex items-center gap-2 text-[#4c8077] hover:text-[#3a6b63] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>{vorige.titel}</span>
                </Link>
              ) : (
                <Link
                  href={`/leerpaden/${slug}`}
                  className="flex items-center gap-2 text-[#4c8077] hover:text-[#3a6b63] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Terug naar leerpad</span>
                </Link>
              )}

              {volgende && (
                <Link
                  href={`/leerpaden/${slug}/${volgende.slug.current}`}
                  className="flex items-center gap-2 bg-[#e53013] text-white px-4 py-2 rounded-lg hover:bg-[#c42a10] transition-colors"
                >
                  <span>Volgende module</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tools */}
            {moduleData.tools && moduleData.tools.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-[#4c8077] mb-4">
                  AI Tools in deze module
                </h3>
                <div className="flex flex-wrap gap-2">
                  {moduleData.tools.map((tool: string) => (
                    <span
                      key={tool}
                      className="bg-[#fee4cc] text-[#e53013] px-3 py-1 rounded-full text-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tutorials */}
            {moduleData.tutorials && moduleData.tutorials.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-[#4c8077] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Gerelateerde Tutorials</span>
                </h3>
                <div className="space-y-3">
                  {moduleData.tutorials.map((tutorial: any) => (
                    <Link
                      key={tutorial._id}
                      href={`/tutorials/${tutorial.slug.current}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-[#fee4cc] border border-transparent hover:border-[#e53013] transition-all"
                    >
                      <h4 className="font-medium text-gray-800 mb-1">
                        {tutorial.title}
                      </h4>
                      {tutorial.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {tutorial.excerpt}
                        </p>
                      )}
                      <div className="text-[#e53013] text-sm font-medium mt-2 flex items-center gap-1">
                        Bekijk tutorial
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Progress info */}
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-sm text-gray-600">
                Module {moduleData.volgorde}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Log in om je voortgang bij te houden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
