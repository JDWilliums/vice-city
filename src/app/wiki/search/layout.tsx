import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search GTA 6 Wiki | Find Articles & Information | vice.city',
  description: 'Search the comprehensive Grand Theft Auto VI wiki for characters, locations, vehicles, missions, gameplay features and more from GTA 6.',
  keywords: 'GTA 6 wiki search, Grand Theft Auto VI search, search GTA 6 database, find GTA 6 info',
  openGraph: {
    title: 'Search GTA 6 Wiki | Find Articles & Information',
    description: 'Search the comprehensive Grand Theft Auto VI wiki for characters, locations, vehicles, missions and more.',
    url: 'https://vice.city/wiki/search',
    siteName: 'vice.city',
    images: [
      {
        url: 'https://vice.city/images/wiki/wiki-header.png',
        width: 1200,
        height: 630,
        alt: 'GTA 6 Wiki Search',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search GTA 6 Wiki | Find Articles & Information',
    description: 'Search the comprehensive Grand Theft Auto VI wiki for characters, locations, vehicles, missions and more.',
    images: ['https://vice.city/images/wiki/wiki-header.png'],
  },
  alternates: {
    canonical: 'https://vice.city/wiki/search',
  }
}

export default function WikiSearchLayout({
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