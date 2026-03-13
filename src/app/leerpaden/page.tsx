import { Metadata } from 'next';
import Link from 'next/link';
import { Construction, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professionalisering | ICT-Advies',
  description: 'Gepersonaliseerde leerpaden voor digitale competenties en professionele ontwikkeling.',
};

export default function LeerpadenComingSoon() {
  return (
    <div className="min-h-screen bg-[#fee4cc]">
      <div className="bg-gradient-to-r from-[#4c8077] to-[#3a6b63] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Professionalisering</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Ontwikkel je digitale vaardigheden met gepersonaliseerde leerpaden.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <Construction className="w-20 h-20 text-brand-orange mx-auto mb-6" />
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Nog in ontwikkeling
            </h2>
            
            <p className="text-gray-600 text-lg mb-6">
              We werken hard aan onze professionaliseringsmodules. 
              Binnenkort vind je hier gepersonaliseerde leerpaden voor:
            </p>

            <ul className="text-left text-gray-700 space-y-3 mb-8 max-w-md mx-auto">
              <li className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <span>Digitale basis (A1→A2)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <span>Digitale integratie (A2→B1)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">🔧</span>
                <span>Digitale verdieping (B1→B2)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span>Digitale innovatie (B2+)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <span>AI bewustzijn (verplicht)</span>
              </li>
            </ul>

            <p className="text-gray-500 mb-8">
              Kom snel terug of neem contact met ons op voor meer informatie.
            </p>

            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-brand-red hover:text-brand-orange transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Terug naar home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
