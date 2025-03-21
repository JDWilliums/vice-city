import { Metadata } from 'next'
import { WIKI_CATEGORIES } from '@/data/wikiData'

export async function generateMetadata({ 
  params 
}: { 
  params: { category: string; slug: string } 
}): Promise<Metadata> {
  // Try to at least get the category
  const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === params.category)
  
  if (categoryInfo) {
    return {
      title: `${categoryInfo.title} | GTA 6 Wiki | vice.city`,
      description: `Information about ${params.slug.replace(/-/g, ' ')} from the GTA 6 Wiki`,
    }
  }
  
  // Default fallback
  return {
    title: 'Article | GTA 6 Wiki | vice.city',
    description: 'Detailed information from the GTA 6 Wiki',
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