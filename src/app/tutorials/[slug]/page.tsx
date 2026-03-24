import { client } from '@/sanity/client';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import TutorialContent from '@/components/TutorialContent';
import OpdrachtComponent from '@/components/OpdrachtComponent';
import OpdrachtTekstClient from '@/components/OpdrachtTekstClient';
import GoogleTrainingenHub from '@/components/GoogleTrainingenHub';
import GoogleTrainingDetail from '@/components/GoogleTrainingDetail';

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
        verplicht,
        screenshotOnly
      }
    }
  `, { slug });

  // Check if this is a Google training subtutorial
  const googleTrainingSlugs = [
    'google-vids-training',
    'google-workspace-basis',
    'google-workspace-gevorderd',
    'google-premium-functies',
    'digitaal-burgerschap-veiligheid',
    'onderwijs-op-afstand',
    'certified-coaches',
    'google-ai-onderwijs'
  ];
  const isGoogleTraining = googleTrainingSlugs.includes(slug);

  // Handle Google training pages even without Sanity document
  if (!tutorial && isGoogleTraining) {
    const trainingTitles: Record<string, string> = {
      'google-vids-training': "Makkelijk video's maken voor het onderwijs met Google Vids",
      'google-workspace-basis': "Basisprincipes van Google Workspace for Education Fundamentals",
      'google-workspace-gevorderd': "Gevorderd gebruik van Google Workspace for Education Fundamentals",
      'google-premium-functies': "Premium functies voor leerlingen en docenten",
      'digitaal-burgerschap-veiligheid': "Cursus 'Digitaal burgerschap en veiligheid'",
      'onderwijs-op-afstand': "Onderwijs op afstand voor docenten",
      'certified-coaches': "Lesprogramma voor Certified Coaches",
      'google-ai-onderwijs': "Aan de slag met AI van Google in het basis- en middelbaar onderwijs"
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
              <div className="relative">
                <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
                  <Link href="/" className="hover:text-white transition">Home</Link>
                  <span>/</span>
                  <Link href="/tutorials" className="hover:text-white transition">Tutorials</Link>
                  <span>/</span>
                  <Link 
                    href="/tutorials/google-online-trainingen" 
                    className="hover:text-white transition"
                  >
                    Google - Online trainingen
                  </Link>
                </nav>

                <Link 
                  href="/tutorials/google-online-trainingen" 
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Alle Google trainingen</span>
                </Link>
                
                <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  <BookOpen className="w-4 h-4" />
                  Google - Online trainingen
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{trainingTitles[slug]}</h1>
              </div>
            </div>
          </div>
        </section>

        {/* Content sectie */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <GoogleTrainingDetail slug={slug} />
          </div>
        </section>

        {/* Footer navigatie */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/tutorials/google-online-trainingen"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-red font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Alle Google trainingen</span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

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
  
  // Check if this tutorial is part of a leerpad
  const isLeerpadModule = slug.includes('ai-bewustzijn-module');
  const leerpadSlug = isLeerpadModule ? 'ai-bewustzijn' : null;

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
                {leerpadSlug ? (
                  <>
                    <Link href="/leerpaden" className="hover:text-white transition">Leerpaden</Link>
                    <span>/</span>
                    <Link 
                      href={`/leerpaden/${leerpadSlug}`} 
                      className="hover:text-white transition"
                    >
                      AI Bewustzijn
                    </Link>
                  </>
                ) : isGoogleTraining ? (
                  <>
                    <Link href="/tutorials" className="hover:text-white transition">Tutorials</Link>
                    <span>/</span>
                    <Link 
                      href="/tutorials/google-online-trainingen" 
                      className="hover:text-white transition"
                    >
                      Google - Online trainingen
                    </Link>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </nav>

              <Link 
                href={
                  leerpadSlug 
                    ? `/leerpaden/${leerpadSlug}` 
                    : isGoogleTraining 
                      ? '/tutorials/google-online-trainingen'
                      : '/tutorials'
                } 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                  {leerpadSlug 
                    ? 'Terug naar het leerpad' 
                    : isGoogleTraining 
                      ? 'Alle Google trainingen'
                      : 'Alle tutorials'}
                </span>
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
          {/* Speciale weergave voor Google Online Trainingen hub */}
          {slug === 'google-online-trainingen' ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <p className="text-gray-600 text-lg mb-6">
                Google biedt kosteloze online trainingen aan voor docenten. Deze trainingen helpen je om je digitale vaardigheden te verbeteren en het maximale uit Google Workspace for Education te halen.
              </p>
              <GoogleTrainingenHub />
            </div>
          ) : isGoogleTraining ? (
            /* Fallback voor Google training subtutorials (werkt ook zonder Sanity document) */
            <GoogleTrainingDetail slug={slug} />
          ) : (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <TutorialContent body={tutorial.body} />
            </div>
          )}
        </div>
      </section>

      {/* Opdracht sectie */}
      {hasOpdracht && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Screenshot-only opdrachten gebruiken OpdrachtComponent */}
            {tutorial.opdracht?.screenshotOnly ? (
              <OpdrachtComponent
                opdracht={tutorial.opdracht}
                tutorialId={tutorial._id}
                tutorialSlug={slug}
              />
            ) : tutorial.category?.slug?.current === 'ai-tools' && tutorial.title.includes('Module') ? (
              /* AI bewustzijn tutorials met tekst-antwoorden gebruiken OpdrachtTekstComponent */
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
            href={
              leerpadSlug 
                ? `/leerpaden/${leerpadSlug}` 
                : isGoogleTraining 
                  ? '/tutorials/google-online-trainingen'
                  : '/tutorials'
            }
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-red font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {leerpadSlug 
                ? 'Terug naar het leerpad' 
                : isGoogleTraining 
                  ? 'Alle Google trainingen'
                  : 'Terug naar alle tutorials'}
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
