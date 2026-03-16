import { MonitorPlay, GraduationCap, FolderOpen, BookOpen, Mail, Lightbulb, Wrench, BarChart3, Users, Video, FileText, Presentation, Sparkles, ArrowRight, Shield } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import { client } from '@/sanity/client';

// Map categorie naar icoon
const categoryIcons: Record<string, typeof MonitorPlay> = {
  'clevertouch': MonitorPlay,
  'google-workspace': Mail,
  'edutools': Lightbulb,
  'google-classroom': GraduationCap,
  'google-drive': FolderOpen,
  'google-sheets': BarChart3,
  'google-docs': FileText,
  'google-slides': Presentation,
  'google-meet': Video,
  'canva': Sparkles,
  'kahoot': Users,
  'quizlet': BookOpen,
  'ai-tools': Sparkles,
  'mediawijs': Shield,
  'default': Wrench,
};

interface FeaturedTutorial {
  title: string;
  slug: { current: string };
  excerpt?: string;
  category?: { title: string; slug: { current: string } };
}

async function getFeaturedTutorials(): Promise<FeaturedTutorial[]> {
  const tutorials = await client.fetch<FeaturedTutorial[]>(`
    *[_type == "tutorial" 
      && featured == true 
      && (status == "published" || !defined(status))
      && isSubtutorial != true
    ]{
      title,
      slug,
      excerpt,
      category->{ title, slug }
    } | order(title asc)
  `);
  return tutorials;
}

export default async function Home() {
  const featuredTutorials = await getFeaturedTutorials();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dark Gradient */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                ICT-ADVIES
              </div>
              
              {/* Headline */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl leading-tight">
                Optimaliseer je digitale klaslokaal
              </h1>
              
              {/* Subtext */}
              <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
                Praktische handleidingen en tips voor Clevertouch, Google Workspace, 
                AI tools en meer — speciaal voor leerkrachten.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/tutorials" 
                  className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start hier
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="#aanraders" 
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  Bekijk aanraders
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section - Alle Categorieën */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rij 1 */}
            <FeatureCard
              icon={GraduationCap}
              title="Google - Online trainingen"
              description="Kosteloze online trainingen van Google voor docenten over digitale vaardigheden."
              href="/tutorials/google-online-trainingen"
              color="red"
            />
            <FeatureCard
              icon={Mail}
              title="Google Workspace"
              description="Alle Google tools voor onderwijs: Classroom, Drive, Docs, Sheets en meer."
              href="/tutorials?categorie=google-workspace"
              color="green"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Tools"
              description="Gebruik AI om je lesvoorbereidingen te versnellen en te verbeteren."
              href="/tutorials?categorie=ai-tools"
              color="cream"
            />
            {/* Rij 2 */}
            <FeatureCard
              icon={MonitorPlay}
              title="Clevertouch"
              description="Handleidingen voor Clevertouch digitale borden in de klas."
              href="/tutorials?categorie=clevertouch"
              color="cream"
            />
            <FeatureCard
              icon={Lightbulb}
              title="EduTools"
              description="Handige educatieve tools voor je lessen: Kahoot, Quizlet, Canva en meer."
              href="/tutorials?categorie=edutools"
              color="orange"
            />
            <FeatureCard
              icon={Shield}
              title="Mediawijs"
              description="Digitale geletterdheid en veilig internetgebruik voor leerlingen."
              href="/tutorials?categorie=mediawijs"
              color="red"
            />
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section id="aanraders" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Aanraders</h2>
            <a 
              href="/tutorials" 
              className="text-brand-red hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
            >
              Bekijk alles
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          {featuredTutorials.length === 0 ? (
            <p className="text-gray-500">Geen uitgelichte handleidingen beschikbaar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTutorials.map((tutorial) => {
                const categorySlug = tutorial.category?.slug?.current || 'default';
                const IconComponent = categoryIcons[categorySlug] || categoryIcons.default;
                
                return (
                  <a 
                    key={tutorial.slug.current}
                    href={`/tutorials/${tutorial.slug.current}`} 
                    className="group p-5 bg-gray-50 rounded-xl hover:bg-brand-cream transition-all duration-300 border border-gray-100 hover:border-brand-orange"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-brand-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors mb-1">
                          {tutorial.title}
                        </h3>
                        {tutorial.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2">{tutorial.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
