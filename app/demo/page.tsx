'use client'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, ExternalLink, ArrowLeft } from 'lucide-react'

export default function DemoPage() {
  const demoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tube/demo123`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfa</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-marine-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Demo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            KanoMarineQRSystem Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aşağıdaki QR kodu okutarak sistemin nasıl çalıştığını görebilirsiniz
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-8 bg-white rounded-2xl shadow-lg">
              <QRCodeSVG
                value={demoUrl}
                size={256}
                level="M"
                includeMargin={true}
                className="mx-auto"
              />
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Demo QR Kodu
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Telefon kameranızla okutun veya QR okuyucu uygulaması kullanın
              </p>
              <Link 
                href={demoUrl}
                className="inline-flex items-center space-x-2 text-marine-600 hover:text-marine-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Direkt Bağlantı</span>
              </Link>
            </div>
          </div>

          {/* Demo Bilgileri */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Demo Tüp Bilgileri
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tüp Tipi:</span>
                  <span className="font-medium">CO2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seri Numarası:</span>
                  <span className="font-medium">2171007</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ağırlık:</span>
                  <span className="font-medium">45 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kapasite:</span>
                  <span className="font-medium">250 L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Muayene Tarihi:</span>
                  <span className="font-medium">09/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sıcaklık:</span>
                  <span className="font-medium">18°C</span>
                </div>
              </div>
            </div>

            <div className="bg-marine-50 border border-marine-200 rounded-lg p-4">
              <h4 className="font-medium text-marine-900 mb-2">
                Nasıl Çalışır?
              </h4>
              <ol className="text-sm text-marine-800 space-y-1">
                <li>1. QR kodu telefon kameranızla okutun</li>
                <li>2. Otomatik olarak tarayıcı açılır</li>
                <li>3. Tüp bilgileri anında görüntülenir</li>
                <li>4. Teknik detayları inceleyin</li>
              </ol>
            </div>

            <div className="text-center">
              <button 
                onClick={() => window.location.href = '/'}
                className="btn-primary inline-block"
              >
                QR Kod Oluşturmaya Başlayın
              </button>
            </div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Sistem Özellikleri
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Anında QR Oluşturma
              </h3>
              <p className="text-gray-600 text-sm">
                Tüp bilgilerini girin, QR kod otomatik oluşsun
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Mobil Uyumlu
              </h3>
              <p className="text-gray-600 text-sm">
                Tüm cihazlarda mükemmel görünüm
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Kolay Yönetim
              </h3>
              <p className="text-gray-600 text-sm">
                Basit form ile tüm bilgileri girin
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
