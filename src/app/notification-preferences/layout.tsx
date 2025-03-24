import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notification Preferences | vice.city',
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
