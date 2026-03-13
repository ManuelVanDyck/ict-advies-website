import { client } from '@/sanity/client';
import Link from 'next/link';
import { GraduationCap, MonitorPlay, Lightbulb } from 'lucide-react';

// Force dynamic rendering in development for instant updates
export const dynamic = 'force-dynamic';

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
  
  const categoryIcons: Record<string, any> = {
    'clevertouch': MonitorPlay,
    'google-workspace': GraduationCap,
    'edutools': Lightbulb
  };

  const selectedCategoryName = selectedCategory 
    ? categories.find((c: any) => c.slug.current === selectedCategory)?.title 
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {selectedCategoryName ? `${selectedCategoryName} Tutorials` : 'Alle Tutorials'}
      </h1>
      <p className="text-gray-600 mb-8">
        {selectedCategoryName 
          ? `${tutorials.length} tutorial${tutorials.length !== 1 ? 's' : ''} in deze categorie`
          : `${tutorials.length} tutorial${tutorials.length !== 1 ? 's' : ''} beschikbaar`
        }
      </p>

      {/* Categories - Klikbaar */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Filter op categorie</h2>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/tutorials"
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              !selectedCategory 
                ? 'bg-brand-red text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-red hover:text-brand-red'
            }`}
          >
            Alle ({categories.reduce((sum: number, c: any) => sum + c.count, 0)})
          </Link>
          
          {categories.map((cat: any) => {
            const Icon = categoryIcons[cat.slug.current] || Lightbulb;
            const isActive = selectedCategory === cat.slug.current;
            
            return (
              <Link 
                key={cat._id}
                href={`/tutorials?categorie=${cat.slug.current}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-red text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-red hover:text-brand-red'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.title} ({cat.count})
              </Link>
            );
          })}
        </div>
      </div>

      {selectedCategory && (
        <Link 
          href="/tutorials"
          className="inline-flex items-center gap-2 text-brand-red hover:underline mb-6"
        >
          ← Bekijk alle tutorials
        </Link>
      )}

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorials.map((tutorial: any) => (
          <Link 
            key={tutorial._id}
            href={`/tutorials/${tutorial.slug.current}`}
            className="group p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-brand-orange transition-all"
          >
            {tutorial.category && (
              <span className="text-xs font-medium text-brand-red mb-2 block">
                {tutorial.category.title}
              </span>
            )}
            <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors mb-2">
              {tutorial.title}
            </h3>
            <p className="text-gray-600 text-sm">{tutorial.excerpt}</p>
          </Link>
        ))}
      </div>
      
      {tutorials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Geen tutorials gevonden in deze categorie.</p>
        </div>
      )}
    </div>
  );
}
