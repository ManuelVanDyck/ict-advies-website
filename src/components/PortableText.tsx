import {
  PortableText,
  type PortableTextComponents,
} from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityImageUrl';

// YouTube video component
function YouTubeVideo({ value }: { value: { url?: string; caption?: string } }) {
  if (!value?.url) return null;
  
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(value.url);
  
  if (!videoId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">Ongeldige YouTube URL: {value.url}</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {value.caption && (
        <p className="text-sm text-gray-600 mb-3 font-medium">{value.caption}</p>
      )}
      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={value.caption || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

// Text renderer for two-column
function TextRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null;
  
  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block: any, index: number) => {
        if (block._type !== 'block') return null;
        
        if (block.style === 'h2') {
          return <h2 key={index} className="text-2xl font-bold mb-3 mt-6 text-gray-900">{block.children?.map((c: any) => c.text).join('')}</h2>;
        }
        if (block.style === 'h3') {
          return <h3 key={index} className="text-xl font-semibold mb-2 mt-4 text-gray-900">{block.children?.map((c: any) => c.text).join('')}</h3>;
        }
        
        const renderChildren = () => block.children?.map((child: any, childIndex: number) => {
          let content: React.ReactNode = child.text || '';
          if (!content) return null;
          
          if (child.marks?.includes('strong')) content = <strong key={childIndex}>{content}</strong>;
          if (child.marks?.includes('em')) content = <em key={childIndex}>{content}</em>;
          if (child.marks?.includes('underline')) content = <u key={childIndex}>{content}</u>;
          
          if (child.marks && block.markDefs) {
            for (const markKey of child.marks) {
              const linkDef = block.markDefs.find((def: any) => def._key === markKey && def._type === 'link');
              if (linkDef?.href) {
                const isExternal = linkDef.href.startsWith('http');
                content = (
                  <a key={childIndex} href={linkDef.href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} className="text-brand-red hover:underline">
                    {content}
                  </a>
                );
                break;
              }
            }
          }
          return <span key={childIndex}>{content}</span>;
        });
        
        return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{renderChildren()}</p>;
      })}
    </div>
  );
}

// Two Column Layout component
function TwoColumn({ value }: { value: { layout?: string; textColumn?: any[]; imageColumn?: any; imageCaption?: string } }) {
  const { layout = 'text-image', textColumn, imageColumn, imageCaption } = value;
  
  const imageUrl = imageColumn ? urlFor(imageColumn).width(600).height(400).url() : null;

  const textContent = <TextRenderer blocks={textColumn || []} />;

  const imageContent = imageUrl && (
    <div className="relative">
      <Image src={imageUrl} alt={imageCaption || 'Afbeelding'} width={600} height={400} className="rounded-lg shadow-md w-full h-auto object-cover" unoptimized />
      {imageCaption && <p className="text-sm text-gray-500 mt-2 text-center">{imageCaption}</p>}
    </div>
  );

  if (!imageUrl && (!textColumn || textColumn.length === 0)) return null;

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {layout === 'text-image' ? (
        <>
          <div>{textContent}</div>
          <div>{imageContent}</div>
        </>
      ) : (
        <>
          <div>{imageContent}</div>
          <div>{textContent}</div>
        </>
      )}
    </div>
  );
}

const components: PortableTextComponents = {
  types: {
    youtube: YouTubeVideo,
    twoColumn: TwoColumn,
    image: ({ value }) => {
      if (!value) return null;
      const imageUrl = urlFor(value).width(800).height(600).url();
      return (
        <div className="mb-8">
          <Image src={imageUrl} alt={value.alt || 'Afbeelding'} width={800} height={600} className="rounded-lg shadow-md w-full h-auto" unoptimized />
          {value.caption && <p className="text-sm text-gray-500 mt-2 text-center">{value.caption}</p>}
        </div>
      );
    },
  },
  block: {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-gray-900">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-8 text-gray-900">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-6 text-gray-900">{children}</h3>,
    normal: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-orange pl-4 py-2 my-4 italic text-gray-700 bg-orange-50 rounded-r-lg">{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <u>{children}</u>,
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return <a href={value?.href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className="text-brand-red hover:underline">{children}</a>;
    },
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="ml-4">{children}</li>,
    number: ({ children }) => <li className="ml-4">{children}</li>,
  },
};

export default function CustomPortableText({ value }: { value: any }) {
  return <PortableText value={value} components={components} />;
}
