import { Metadata } from 'next'
import { WIKI_CATEGORIES } from '@/data/wikiData'
import { getWikiPageBySlug } from '@/lib/wikiFirestoreService'
import { getLocalImageUrl } from '@/lib/localImageService'

export async function generateMetadata({ 
  params 
}: { 
  params: { category: string; slug: string } 
}): Promise<Metadata> {
  try {
    // Fetch wiki page data
    const wikiPage = await getWikiPageBySlug(params.slug)
    
    // Get category info
    const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === params.category)
    
    if (wikiPage) {
      // Format title and description
      const pageTitle = `${wikiPage.title} | ${categoryInfo?.title || 'Wiki'} | GTA 6 Wiki`
      const pageDescription = wikiPage.description || `Information about ${params.slug.replace(/-/g, ' ')} in Grand Theft Auto VI.`
      
      // Get image URL (use page image or default category image)
      const imageUrl = wikiPage.imageUrl || getLocalImageUrl(params.category)
      
      // Handle Firestore Timestamp conversion for updatedAt
      let modifiedTime: string | undefined = undefined
      if (wikiPage.updatedAt) {
        // Handle Firestore Timestamp objects
        const isTimestamp = typeof wikiPage.updatedAt === 'object' && 
                           wikiPage.updatedAt !== null && 
                           'toDate' in wikiPage.updatedAt && 
                           typeof wikiPage.updatedAt.toDate === 'function'
                           
        const timestamp = isTimestamp 
          ? wikiPage.updatedAt.toDate() 
          : new Date(wikiPage.updatedAt as any)
        
        modifiedTime = timestamp.toISOString()
      }
      
      // Build keywords from tags or defaults
      const keywordTags = wikiPage.tags && wikiPage.tags.length > 0 
        ? wikiPage.tags.join(', ') 
        : `GTA 6 ${wikiPage.title}, Grand Theft Auto VI`
      
      return {
        title: pageTitle,
        description: pageDescription,
        keywords: `${keywordTags}, GTA 6 Wiki, ${params.category}`,
        openGraph: {
          title: wikiPage.title,
          description: pageDescription,
          url: `https://vice.city/wiki/${params.category}/${params.slug}`,
          siteName: 'vice.city',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: wikiPage.title,
            }
          ],
          locale: 'en_US',
          type: 'article',
          modifiedTime,
          tags: wikiPage.tags || [],
        },
        twitter: {
          card: 'summary_large_image',
          title: wikiPage.title,
          description: pageDescription,
          images: [imageUrl],
        },
        alternates: {
          canonical: `https://vice.city/wiki/${params.category}/${params.slug}`,
        }
      }
    } else if (categoryInfo) {
      // If page not found but category exists, return category info
      return {
        title: `${categoryInfo.title} | GTA 6 Wiki | vice.city`,
        description: `Information about ${params.slug.replace(/-/g, ' ')} from the GTA 6 Wiki ${categoryInfo.title} section.`,
        openGraph: {
          title: `${categoryInfo.title} | GTA 6 Wiki`,
          description: categoryInfo.description,
          url: `https://vice.city/wiki/${params.category}`,
          siteName: 'vice.city',
          images: [
            {
              url: getLocalImageUrl(params.category),
              width: 1200,
              height: 630,
              alt: `GTA 6 Wiki - ${categoryInfo.title}`,
            }
          ],
          locale: 'en_US',
          type: 'website',
        }
      }
    }
  } catch (error) {
    console.error('Error generating wiki page metadata:', error)
  }
  
  // Default fallback
  return {
    title: 'Wiki Article | GTA 6 Wiki | vice.city',
    description: 'Detailed information from the GTA 6 Wiki about Grand Theft Auto VI',
    openGraph: {
      title: 'GTA 6 Wiki Article',
      description: 'Detailed information from the GTA 6 Wiki about Grand Theft Auto VI',
      url: 'https://vice.city/wiki',
      siteName: 'vice.city',
      locale: 'en_US',
      type: 'article',
    }
  }
}

export default function WikiArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 