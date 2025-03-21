import { Metadata } from 'next'
import { WIKI_CATEGORIES } from '@/data/wikiData'

export async function generateMetadata({ 
  params 
}: { 
  params: { category: string } 
}): Promise<Metadata> {
  // Find the category information
  const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === params.category)
  
  if (categoryInfo) {
    return {
      title: `${categoryInfo.title} | GTA 6 Wiki | vice.city`,
      description: categoryInfo.description || 'Explore the GTA 6 Wiki for detailed information',
    }
  }
  
  // Default metadata if category not found
  return {
    title: 'Category | GTA 6 Wiki | vice.city',
    description: 'Explore the GTA 6 Wiki for detailed information',
  }
}

export default function WikiCategoryLayout({
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