import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GTA 6 Gallery | Screenshots & Wallpapers | vice.city',
  description: 'Explore high-quality GTA 6 screenshots, official artwork, wallpapers and fan creations from Grand Theft Auto VI. Download in multiple resolutions including 4K & mobile.',
  keywords: 'GTA 6 gallery, GTA 6 screenshots, GTA 6 wallpapers, Grand Theft Auto VI images, GTA 6 artwork, GTA 6 phone wallpapers, 4K GTA wallpapers',
  openGraph: {
    title: 'GTA 6 Gallery | Screenshots & Wallpapers',
    description: 'Explore high-quality GTA 6 screenshots, official artwork, wallpapers and fan creations from Grand Theft Auto VI.',
    url: 'https://vice.city/gallery',
    siteName: 'vice.city',
    images: [
      {
        url: 'https://vice.city/images/gta6-0.png',
        width: 1200,
        height: 630,
        alt: 'GTA 6 Gallery',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA 6 Gallery | Screenshots & Wallpapers',
    description: 'Explore high-quality GTA 6 screenshots, official artwork, wallpapers and fan creations in multiple resolutions.',
    images: ['https://vice.city/images/gta6-0.png'],
  },
  alternates: {
    canonical: 'https://vice.city/gallery',
  }
}

export default function GalleryLayout({
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
