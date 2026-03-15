import { client } from '@/sanity/client';
import Link from 'next/link';
import { GraduationCap, MonitorPlay, Lightbulb, Mail, Sparkles, Shield, BookOpen, FolderOpen, BarChart3, Video, FileText, Presentation, Users } from 'lucide-react';

// Force dynamic rendering in development for instant updates
export const dynamic = 'force-dynamic';

const categoryIcons: Record<string, any> = {
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
};

export default async function TutorialsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params.categorie || null;
  
  // Haal alle categorieën op (count alleen gepubliceerde tutorials, geen subtutorials)
  const categories = await client.fetch(`
    *[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      description,
      "count": count(*[_type == "tutorial" && references(^._id) && (status == "published" || !defined(status)) && isSubtutorial != true])
    }
  `);
  
  // Haal tutorials op: published, geen subtutorials
  let tutorials;
  if (selectedCategory) {
    tutorials = await client.fetch(`
      *[_type == "tutorial" && category->slug.current == $category && (status == "published" || !defined(status)) && isSubtutorial != true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        "category": category->{ title, slug }
      }
    `, { category: selectedCategory });
  } else {
    tutorials = await client.fetch(`
      *[_type == "tutorial" && (status == "published" || !defined(status)) && isSubtutorial != true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        "category": category->{ title, slug }
      }
    `);
  }

  const selectedCategoryName = selectedCategory 
    ? categories.find((c: any) => c.slug.current === selectedCategory)?.title 
    : null;

  const totalCount = categories.reduce((sum: number, c: any) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 overflow-hidden shadow-xl">
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-brand-red/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                HANDLEIDINGEN
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {selectedCategoryName || 'Alle Tutorials'}
              </h1>
              
              <p className="text-gray-300 text-base md:text-lg max-w-2xl">
                {selectedCategoryName 
                  ? `${tutorials.length} tutorial${tutorials.length !== 1 ? 's' : ''} in deze categorie`
                  : `${tutorials.length} tutorial${tutorials.length !== 1 ? 's' : ''} beschikbaar`
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/tutorials"
              className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                !selectedCategory 
                  ? 'bg-brand-red text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              Alle ({totalCount})
            </Link>
            
            {categories.map((cat: any) => {
              const Icon = categoryIcons[cat.slug.current] || Lightbulb;
              const isActive = selectedCategory === cat.slug.current;
              
              return (
                <Link 
                  key={cat._id}
                  href={`/tutorials?categorie=${cat.slug.current}`}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                    isActive 
                      ? 'bg-brand-red text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.title} ({cat.count})
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {selectedCategory && (
            <Link 
              href="/tutorials"
              className="inline-flex items-center gap-2 text-brand-red hover:text-red-700 font-medium mb-6 transition-colors"
            >
              ← Bekijk alle tutorials
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorials.map((tutorial: any) => {
              const categorySlug = tutorial.category?.slug?.current || 'default';
              const IconComponent = categoryIcons[categorySlug] || Lightbulb;
              
              return (
                <Link 
                  key={tutorial._id}
                  href={`/tutorials/${tutorial.slug.current}`}
                  className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-brand-orange"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-cream transition-colors">
                      <IconComponent className="w-5 h-5 text-brand-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {tutorial.category && (
                        <span className="text-xs font-medium text-brand-red mb-1 block">
                          {tutorial.category.title}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors mb-1">
                        {tutorial.title}
                      </h3>
                      {tutorial.excerpt && (
                        <p className="text-gray-500 text-sm line-clamp-2">{tutorial.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {tutorials.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">Geen tutorials gevonden in deze categorie.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
