import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'GTA 6 Wiki | Comprehensive Guide & Database | vice.city',
  description: 'The most comprehensive GTA 6 wiki featuring detailed information on characters, locations, missions, vehicles, weapons, and gameplay mechanics in Grand Theft Auto VI.',
  keywords: 'GTA 6 wiki, Grand Theft Auto VI database, GTA 6 guide, GTA 6 characters, GTA 6 locations, GTA 6 missions, GTA 6 vehicles, GTA 6 weapons',
  openGraph: {
    title: 'GTA 6 Wiki | Comprehensive Guide & Database',
    description: 'The most comprehensive GTA 6 wiki featuring detailed information on characters, locations, missions, vehicles, weapons, and gameplay mechanics.',
    url: 'https://vice.city/wiki',
    siteName: 'vice.city',
    images: [
      {
        url: 'https://vice.city/images/wiki/wiki-header.png',
        width: 1200,
        height: 630,
        alt: 'GTA 6 Wiki',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA 6 Wiki | Comprehensive Guide & Database',
    description: 'The most comprehensive GTA 6 wiki featuring detailed information on characters, locations, missions, vehicles, and more.',
    images: ['https://vice.city/images/wiki/wiki-header.png'],
  },
  alternates: {
    canonical: 'https://vice.city/wiki',
  }
}

export default function WikiLayout({
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
