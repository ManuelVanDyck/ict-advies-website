import {
  PortableText,
  type PortableTextComponents,
} from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityImageUrl';
import AccordionSection from './AccordionSection';

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

// PDF file component
function PdfFile({ value }: { value: { file?: any; title?: string; description?: string } }) {
  if (!value?.file?.asset?._ref) return null;
  
  // Extract file URL from Sanity asset reference
  const assetRef = value.file.asset._ref;
  const [_file, id, extension] = assetRef.split('-');
  const fileName = `${id}.${extension}`;
  const projectId = 'mgu8mw2o'; // Sanity project ID
  const dataset = 'production';
  
  const fileUrl = `https://cdn.sanity.io/files/${projectId}/${dataset}/${fileName}`;
  
  return (
    <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-brand-red/10 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {value.title || 'PDF Document'}
          </h3>
          {value.description && (
            <p className="text-gray-600 text-sm mb-3">{value.description}</p>
          )}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Open PDF in nieuw tabblad
          </a>
        </div>
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
    pdfFile: PdfFile,
    twoColumn: TwoColumn,
    accordionSection: AccordionSection,
    customImage: ({ value }) => {
      if (!value?.image) return null;
      
      // Size mapping: width values for different sizes
      const sizeConfig: Record<string, { width: number; height: number; maxWidth: string; fit?: string }> = {
        small: { width: 400, height: 300, maxWidth: 'max-w-md' },
        medium: { width: 600, height: 450, maxWidth: 'max-w-xl' },
        large: { width: 800, height: 600, maxWidth: 'max-w-3xl' },
        full: { width: 1200, height: 900, maxWidth: 'max-w-full' },
        'fit-width': { width: 800, height: 0, maxWidth: 'max-w-3xl', fit: 'max' },
        'fit-height': { width: 800, height: 0, maxWidth: 'max-w-3xl', fit: 'max' },
      };
      
      const config = sizeConfig[value.size as keyof typeof sizeConfig] || sizeConfig.large;
      
      // Build image URL - for fit options, don't set height to prevent cropping
      let imageUrlBuilder = urlFor(value.image).width(config.width);
      if (!config.fit) {
        imageUrlBuilder = imageUrlBuilder.height(config.height);
      }
      const imageUrl = imageUrlBuilder.url();
      
      // For fit options, use a regular img tag to allow natural height
      if (config.fit) {
        return (
          <div className={`mb-8 ${config.maxWidth} mx-auto`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={value.alt || 'Afbeelding'} 
              className="rounded-lg shadow-md w-full h-auto" 
            />
            {value.caption && <p className="text-sm text-gray-500 mt-2 text-center">{value.caption}</p>}
          </div>
        );
      }
      
      return (
        <div className={`mb-8 ${config.maxWidth} mx-auto`}>
          <Image 
            src={imageUrl} 
            alt={value.alt || 'Afbeelding'} 
            width={config.width} 
            height={config.height} 
            className="rounded-lg shadow-md w-full h-auto" 
            unoptimized 
          />
          {value.caption && <p className="text-sm text-gray-500 mt-2 text-center">{value.caption}</p>}
        </div>
      );
    },
    image: ({ value }) => {
      // Legacy support for old image type
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
