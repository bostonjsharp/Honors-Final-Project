import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ARIA v2.1',
  description: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="crt min-h-screen">{children}</body>
    </html>
  )
}
