import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, CheckCircle2, PlayCircle, BookOpen, Lightbulb } from 'lucide-react';
import { client } from '@/sanity/client';
import LeerpadModules from '@/components/LeerpadModules';
import CertificaatDownload from '@/components/CertificaatDownload';

export default async function LeerpadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { slug } = await params;

  // Fetch leerpad from Sanity
  const leerpad = await client.fetch(`
    *[_type == "leerpad" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      leerdoelstellingen,
      voorkennis,
      voorbereiding,
      "modules": modules[]->{
        _id,
        title,
        slug,
        "category": category->{ title, slug },
        body,
        opdracht {
          ingeschakeld,
          titel,
          instructie,
          criteria,
          maxScore,
          deadline,
          verplicht,
          voorbeeld
        }
      }
    }
  `, { slug });

  // Reorder modules: 5,6,1,3,2,4 (stijgende moeilijkheid)
  if (leerpad?.modules) {
    const desiredOrder = [
      'ai-bewustzijn-module-5',
      'ai-bewustzijn-module-6',
      'ai-bewustzijn-module-1',
      'ai-bewustzijn-module-3',
      'ai-bewustzijn-module-2',
      'ai-bewustzijn-module-4',
    ];
    const moduleMap = new Map(leerpad.modules.map((m: any) => [m.slug?.current, m]));
    leerpad.modules = desiredOrder
      .map(slug => moduleMap.get(slug))
      .filter(Boolean);
  }

  if (!leerpad) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/leerpaden" className="text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Alle leerpaden</span>
          </Link>

          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                {leerpad.title || leerpad.slug?.current}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {leerpad.title || leerpad.slug?.current}
              </h1>

              {leerpad.description && (
                <p className="text-gray-300 text-lg">{leerpad.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Leerdoelstellingen */}
          {leerpad.leerdoelstellingen && leerpad.leerdoelstellingen.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-brand-red" />
                Leerdoelstellingen
              </h2>
              <ul className="space-y-3">
                {leerpad.leerdoelstellingen.map((ld: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{ld}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Voorkennis */}
          {leerpad.voorkennis && leerpad.voorkennis.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-brand-orange" />
                Voorkennis
              </h2>
              <ul className="space-y-3">
                {leerpad.voorkennis.map((vk: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <PlayCircle className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{vk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Voorbereiding */}
          {leerpad.voorbereiding && leerpad.voorbereiding.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-brand-green" />
                Voorbereiding
              </h2>
              <ul className="space-y-4">
                {leerpad.voorbereiding.map((vb: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-4">
                    <Lightbulb className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{vb.titel}</div>
                      <p className="text-gray-600 mb-2">{vb.beschrijving}</p>
                      <Link
                        href={vb.link}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        Bekijk tutorials
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modules */}
          {leerpad.modules && leerpad.modules.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-brand-green" />
                Modules ({leerpad.modules.length})
              </h2>

              <LeerpadModules modules={leerpad.modules} />
            </div>
          )}

          {/* Certificaat - alleen voor AI Bewustzijn */}
          {slug === 'ai-bewustzijn' && (
            <CertificaatDownload />
          )}

          {/* Mijn voortgang link */}
          <Link
            href="/mijn-voortgang"
            className="block bg-brand-green hover:bg-green-600 text-white rounded-xl p-6 text-center transition-colors"
          >
            <h3 className="text-xl font-bold mb-1">Mijn voortgang</h3>
            <p className="text-white/90">Bekijk je voortgang in dit leerpad</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
