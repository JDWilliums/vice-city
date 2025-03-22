import { Metadata } from 'next'
import '@/styles/prism.css'

export const metadata: Metadata = {
  title: 'GTA 6 News | Latest Updates & Announcements | vice.city',
  description: 'Stay updated with the latest GTA 6 news, official announcements, features, and in-depth guides about Grand Theft Auto VI from Rockstar Games.',
  keywords: 'GTA 6, Grand Theft Auto VI, GTA news, Rockstar Games, GTA 6 announcements, GTA 6 features, GTA 6 guides',
  openGraph: {
    title: 'GTA 6 News | Latest Updates & Announcements',
    description: 'Stay updated with the latest GTA 6 news, official announcements, features, and in-depth guides about Grand Theft Auto VI.',
    url: 'https://vice.city/news',
    siteName: 'vice.city',
    images: [
      {
        url: 'https://vice.city/images/gta6-10.png',
        width: 1200,
        height: 630,
        alt: 'GTA 6 News',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA 6 News | Latest Updates & Announcements',
    description: 'Stay updated with the latest GTA 6 news, official announcements, features, and in-depth guides.',
    images: ['https://vice.city/images/gta6-10.png'],
  },
  alternates: {
    canonical: 'https://vice.city/news',
  }
}

export default function NewsLayout({
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
