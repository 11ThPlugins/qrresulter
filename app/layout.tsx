import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KanoMarineQRSystem - Tüp Takip Sistemi',
  description: 'Profesyonel QR kod tabanlı endüstriyel tüp takip ve yönetim sistemi',
  keywords: ['QR kod', 'tüp takip', 'endüstriyel', 'Kano Marine'],
  authors: [{ name: 'Kano Marine' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
