import { client } from '@/sanity/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomPortableText from '@/components/PortableText';
import OpdrachtComponent from '@/components/OpdrachtComponent';

// Force dynamic rendering in development for instant updates
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const tutorials = await client.fetch(`*[_type == "tutorial"]{ slug }`);
  return tutorials.map((tutorial: any) => ({
    slug: tutorial.slug.current,
  }));
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tutorial = await client.fetch(`
    *[_type == "tutorial" && slug.current == $slug && (status == "published" || !defined(status))][0] {
      _id,
      title,
      excerpt,
      publishedAt,
      body,
      "category": category->{ title, slug },
      opdracht {
        ingeschakeld,
        titel,
        instructie,
        templateSheetUrl,
        criteria,
        maxScore,
        deadline
      }
    }
  `, { slug });

  if (!tutorial) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Tutorial niet gevonden</h1>
        <Link href="/tutorials" className="text-brand-red hover:underline mt-4 inline-block">
          ← Terug naar alle tutorials
        </Link>
      </div>
    );
  }

  const hasOpdracht = tutorial.opdracht?.ingeschakeld && tutorial.opdracht?.titel;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-brand-red transition">Home</Link>
        <span>/</span>
        <Link href="/tutorials" className="hover:text-brand-red transition">Tutorials</Link>
        {tutorial.category && (
          <>
            <span>/</span>
            <Link 
              href={`/tutorials?categorie=${tutorial.category.slug.current}`} 
              className="hover:text-brand-red transition"
            >
              {tutorial.category.title}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800">{tutorial.title}</span>
      </nav>

      <Link href="/tutorials" className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-red mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Alle tutorials</span>
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">{tutorial.title}</h1>
      <p className="text-gray-600 mb-8">{tutorial.excerpt}</p>

      <div className="prose prose-lg max-w-none">
        {tutorial.body && <CustomPortableText value={tutorial.body} />}
      </div>

      {/* Opdracht sectie */}
      {hasOpdracht && (
        <OpdrachtComponent
          opdracht={tutorial.opdracht}
          tutorialId={tutorial._id}
          tutorialSlug={slug}
        />
      )}
    </div>
  );
}
