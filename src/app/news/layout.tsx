import { Metadata } from 'next'
import '@/styles/prism.css'

export const metadata: Metadata = {
  title: 'GTA 6 News | vice.city',
  description: 'The latest news and updates about Grand Theft Auto 6',
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
