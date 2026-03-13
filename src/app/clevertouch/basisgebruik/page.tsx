import { client } from '@/sanity/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomPortableText from '@/components/PortableText';

export const revalidate = 60;

export default async function BasisgebruikPage() {
  // Probeer Sanity content op te halen
  const sanityTutorial = await client.fetch(`
    *[_type == "tutorial" && slug.current == "clevertouch-basisgebruik"][0] {
      _id,
      title,
      excerpt,
      body
    }
  `);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/clevertouch" className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-red mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Terug naar Clevertouch</span>
      </Link>

      {sanityTutorial ? (
        <>
          <h1 className="text-3xl font-bold mb-2">{sanityTutorial.title}</h1>
          <p className="text-gray-600 mb-8">{sanityTutorial.excerpt}</p>

          <div className="prose prose-lg max-w-none">
            {sanityTutorial.body && <CustomPortableText value={sanityTutorial.body} />}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Geen content gevonden in Sanity.</p>
          <p className="text-sm text-gray-400 mt-2">
            Voeg een tutorial toe met slug "clevertouch-basisgebruik" in Sanity.
          </p>
        </div>
      )}
    </div>
  );
}
