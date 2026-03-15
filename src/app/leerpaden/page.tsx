import { Metadata } from 'next';
import Link from 'next/link';
import { Construction, ArrowLeft, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professionalisering | ICT-Advies',
  description: 'Gepersonaliseerde leerpaden voor digitale competenties en professionele ontwikkeling.',
};

export default function LeerpadenComingSoon() {
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

      {/* Coming Soon Content */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
            <Construction className="w-16 h-16 text-brand-orange mx-auto mb-6" />
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nog in ontwikkeling
            </h2>
            
            <p className="text-gray-600 mb-6">
              We werken hard aan onze professionaliseringsmodules. 
              Binnenkort vind je hier gepersonaliseerde leerpaden voor:
            </p>

            <ul className="text-left text-gray-700 space-y-3 mb-8 max-w-sm mx-auto">
              <li className="flex items-center gap-3">
                <span className="text-xl">🌱</span>
                <span>Digitale basis (A1→A2)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">🔍</span>
                <span>Digitale integratie (A2→B1)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">🔧</span>
                <span>Digitale verdieping (B1→B2)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">🚀</span>
                <span>Digitale innovatie (B2+)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">🤖</span>
                <span>AI bewustzijn (verplicht)</span>
              </li>
            </ul>

            <p className="text-gray-500 mb-8">
              Kom snel terug of neem contact met ons op voor meer informatie.
            </p>

            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-brand-red hover:text-red-700 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Terug naar home</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
