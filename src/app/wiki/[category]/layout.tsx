import { Metadata } from 'next'
import { WIKI_CATEGORIES } from '@/data/wikiData'
import { getLocalImageUrl } from '@/lib/localImageService'

type Params = {
  category: string;
};

export async function generateMetadata({ 
  params 
}: { 
  params: Params
}): Promise<Metadata> {
  // Find the category information
  const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === params.category)
  
  if (categoryInfo) {
    const title = `${categoryInfo.title} | GTA 6 Wiki | vice.city`
    const description = categoryInfo.description || `Explore the comprehensive GTA 6 Wiki section on ${categoryInfo.title.toLowerCase()} from Grand Theft Auto VI.`
    const categoryImage = getLocalImageUrl(params.category)
    
    return {
      title,
      description,
      keywords: `GTA 6 ${categoryInfo.title.toLowerCase()}, Grand Theft Auto VI ${categoryInfo.title.toLowerCase()}, GTA 6 Wiki, ${params.category}`,
      openGraph: {
        title: `${categoryInfo.title} | GTA 6 Wiki`,
        description: categoryInfo.description,
        url: `https://vice.city/wiki/${params.category}`,
        siteName: 'vice.city',
        images: [
          {
            url: categoryImage,
            width: 1200,
            height: 630,
            alt: `GTA 6 Wiki - ${categoryInfo.title}`,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${categoryInfo.title} | GTA 6 Wiki`,
        description: categoryInfo.description,
        images: [categoryImage],
      },
      alternates: {
        canonical: `https://vice.city/wiki/${params.category}`,
      }
    }
  }
  
  // Default metadata if category not found
  return {
    title: 'Category | GTA 6 Wiki | vice.city',
    description: 'Explore the GTA 6 Wiki for detailed information about Grand Theft Auto VI',
    openGraph: {
      title: 'GTA 6 Wiki',
      description: 'Explore the GTA 6 Wiki for detailed information about Grand Theft Auto VI',
      url: 'https://vice.city/wiki',
      siteName: 'vice.city',
      locale: 'en_US',
      type: 'website',
    }
  }
}

export default function WikiCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Params;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 