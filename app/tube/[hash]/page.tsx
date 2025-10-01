'use client'

import { useEffect } from 'react'

interface PageProps {
  params: {
    hash: string
  }
}

export default function TubePage({ params }: PageProps) {
  useEffect(() => {
    // GitHub Pages URL'ini buraya yazın (repository oluşturduktan sonra)
    const githubPagesUrl = `https://11thplugins.github.io/qrresulter/?id=${params.hash}`
    
    // Anında yönlendir
    window.location.replace(githubPagesUrl)
  }, [params.hash])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Yönlendiriliyor...</h2>
        <p className="text-gray-600">Tüp bilgileri GitHub Pages'te açılıyor.</p>
        <p className="text-sm text-gray-500 mt-2">QR Kod: {params.hash}</p>
      </div>
    </div>
  )
}

// Metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Tüp Bilgileri - ${params.hash} | Kano Marine QR`,
    description: `Tüp bilgileri GitHub Pages'e yönlendiriliyor. QR Kod: ${params.hash}`,
  }
}

