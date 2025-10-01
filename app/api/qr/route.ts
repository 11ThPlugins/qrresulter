import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { text, options = {} } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 })
    }

    // QR kod seçenekleri
    const qrOptions = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      ...options
    }

    // QR kod oluştur
    const qrDataURL = await QRCode.toDataURL(text, qrOptions)
    
    return NextResponse.json({
      success: true,
      qrCode: qrDataURL,
      text: text
    })
  } catch (error) {
    console.error('QR kod oluşturma hatası:', error)
    return NextResponse.json({ 
      error: 'QR kod oluşturulamadı',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
