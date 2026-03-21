import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, Lock, CheckCircle2 } from 'lucide-react';
import { client } from '@/sanity/client';

export const metadata: Metadata = {
  title: 'Professionalisering | ICT-Advies',
  description: 'Gepersonaliseerde leerpaden voor digitale competenties en professionele ontwikkeling.',
};

export default async function LeerpadenPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/leerpaden');
  }

  // Check if user has @classroomatheneum.be email (already enforced in auth, but double check)
  const userEmail = session.user.email || '';
  const hasAccess = userEmail.includes('@classroomatheneum.be');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Geen toegang
              </h2>
              <p className="text-gray-600 mb-6">
                De professionalisering is alleen toegankelijk voor medewerkers van GO! atheneum Gentbrugge.
              </p>
              <a
                href="mailto:ict@atheneumgentbrugge.be"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Contacteer ICT
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Fetch leerpaden from Sanity
  const leerpaden = await client.fetch(`
    *[_type == "leerpad"] | order(slug.current asc) {
      _id,
      title,
      titel,
      slug,
      description
    }
  `);

  // Available leerpaden (AI bewustzijn is published)
  const availableLeerpaden = leerpaden.filter((lp: any) => lp.slug?.current === 'ai-bewustzijn');
  const constructionLeerpaden = leerpaden.filter((lp: any) => lp.slug?.current !== 'ai-bewustzijn');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                PROFESSIONALISERING
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ontwikkel je digitale vaardigheden
              </h1>

              <p className="text-gray-300 text-base md:text-lg max-w-2xl">
                Gepersonaliseerde leerpaden voor digitale competenties en professionele ontwikkeling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Leerpaden */}
      {availableLeerpaden.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Beschikbare leerpaden
            </h2>

            <div className="grid gap-6">
              {availableLeerpaden.map((leerpad: any) => (
                <div
                  key={leerpad._id}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {leerpad.title || leerpad.titel || leerpad.slug?.current}
                      </h3>
                      {leerpad.description && (
                        <p className="text-gray-600">{leerpad.description}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Beschikbaar
                    </span>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/leerpaden/${leerpad.slug?.current}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Start leerpad
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Under Construction */}
      {constructionLeerpaden.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nog in ontwikkeling
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {constructionLeerpaden.map((leerpad: any) => (
                <div
                  key={leerpad._id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-dashed border-gray-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">
                      {leerpad.title || leerpad.titel || leerpad.slug?.current}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Leerpad is nog in ontwikkeling. Kom binnenkort terug.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mijn voortgang */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/mijn-voortgang"
            className="block bg-brand-green hover:bg-green-600 text-white rounded-xl p-6 text-center transition-colors"
          >
            <h3 className="text-xl font-bold mb-1">Mijn voortgang</h3>
            <p className="text-white/90">Bekijk je voortgang in alle leerpaden</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
