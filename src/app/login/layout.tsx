import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login to your account | vice.city',
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
