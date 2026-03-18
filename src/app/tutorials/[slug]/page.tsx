import { client } from '@/sanity/client';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import CustomPortableText from '@/components/PortableText';
import OpdrachtComponent from '@/components/OpdrachtComponent';
import OpdrachtTekstClient from '@/components/OpdrachtTekstClient';

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
      slug,
      "category": category->{ title, slug },
      opdracht {
        ingeschakeld,
        titel,
        instructie,
        templateSheetUrl,
        criteria,
        maxScore,
        deadline,
        verplicht
      }
    }
  `, { slug });

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-4">Tutorial niet gevonden</h1>
            <Link href="/tutorials" className="text-brand-red hover:text-red-700 font-medium">
              ← Terug naar alle tutorials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasOpdracht = tutorial.opdracht?.ingeschakeld && tutorial.opdracht?.titel;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="relative">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <span>/</span>
                <Link href="/tutorials" className="hover:text-white transition">Tutorials</Link>
                {tutorial.category && (
                  <>
                    <span>/</span>
                    <Link 
                      href={`/tutorials?categorie=${tutorial.category.slug.current}`} 
                      className="hover:text-white transition"
                    >
                      {tutorial.category.title}
                    </Link>
                  </>
                )}
              </nav>

              <Link href="/tutorials" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                <ArrowLeft className="w-4 h-4" />
                <span>Alle tutorials</span>
              </Link>
              
              {tutorial.category && (
                <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  <BookOpen className="w-4 h-4" />
                  {tutorial.category.title}
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{tutorial.title}</h1>
              {tutorial.excerpt && (
                <p className="text-gray-300 text-lg">{tutorial.excerpt}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content sectie - wit */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
              {tutorial.body && <CustomPortableText value={tutorial.body} />}
            </div>
          </div>
        </div>
      </section>

      {/* Opdracht sectie */}
      {hasOpdracht && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* AI bewustzijn tutorials (AI Tools categorie + Module titel) gebruiken OpdrachtTekstComponent */}
            {tutorial.category?.slug?.current === 'ai-tools' && tutorial.title.includes('Module') ? (
              <OpdrachtTekstClient
                opdracht={tutorial.opdracht}
                tutorialId={tutorial._id}
                tutorialSlug={slug}
                opdrachtId={slug}
                tutorialTitle={tutorial.title}
              />
            ) : (
              <OpdrachtComponent
                opdracht={tutorial.opdracht}
                tutorialId={tutorial._id}
                tutorialSlug={slug}
              />
            )}
          </div>
        </section>
      )}

      {/* Footer navigatie */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/tutorials" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-red font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar alle tutorials</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
