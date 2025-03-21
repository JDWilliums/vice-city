import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Article | GTA 6 News | vice.city',
  description: 'Read the latest news about Grand Theft Auto 6',
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