import { Metadata } from 'next'
import { getNewsArticleBySlug } from '@/lib/newsFirestoreService'

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    // Fetch article data
    const article = await getNewsArticleBySlug(params.slug)
    
    if (article) {
      const title = `${article.title} | GTA 6 News | vice.city`
      const description = article.excerpt || `Read about ${article.title} in our GTA 6 news section`
      
      // Handle Firestore Timestamp conversion
      let publishedTime: string | undefined = undefined
      if (article.createdAt) {
        // Handle Firestore Timestamp objects
        const isTimestamp = typeof article.createdAt === 'object' && 
                           article.createdAt !== null && 
                           'toDate' in article.createdAt && 
                           typeof article.createdAt.toDate === 'function'
                           
        const timestamp = isTimestamp 
          ? article.createdAt.toDate() 
          : new Date(article.createdAt as any)
        
        publishedTime = timestamp.toISOString()
      }
      
      return {
        title,
        description,
        keywords: `GTA 6, Grand Theft Auto VI, ${article.category}, ${article.title.toLowerCase()}, Rockstar Games`,
        openGraph: {
          title: article.title,
          description: article.excerpt,
          url: `https://vice.city/news/${article.slug}`,
          siteName: 'vice.city',
          images: [
            {
              url: article.imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            }
          ],
          locale: 'en_US',
          type: 'article',
          publishedTime,
          authors: [article.author],
          tags: [article.category, 'GTA 6', 'Grand Theft Auto VI'],
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.excerpt,
          images: [article.imageUrl],
        },
        alternates: {
          canonical: `https://vice.city/news/${article.slug}`,
        }
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  // Default metadata if article not found or error occurs
  return {
    title: 'GTA 6 News Article | vice.city',
    description: 'Read the latest news about Grand Theft Auto 6',
    openGraph: {
      title: 'GTA 6 News Article',
      description: 'Read the latest news about Grand Theft Auto 6',
      url: 'https://vice.city/news',
      siteName: 'vice.city',
      locale: 'en_US',
      type: 'article',
    }
  }
}

export default function ArticleLayout({
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