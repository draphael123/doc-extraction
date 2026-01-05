import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Document Scrapper',
  description: 'Extract information from large document bases',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
