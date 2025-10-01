import { notFound } from 'next/navigation'
import { QrCode, Calendar, Thermometer, Weight, Gauge, MapPin } from 'lucide-react'

// Bu demo için statik veri kullanıyoruz
// Gerçek uygulamada Supabase'den çekilecek
const mockTubeData = {
  'demo123': {
    id: 'demo123',
    tubeType: 'CO2',
    serialNumber: '2171007',
    weight: 45,
    capacity: 250,
    pressure: 79.6,
    volume: 124.8,
    inspectionDate: '2025-09-01',
    temperature: 18,
    statusCodes: '2+3+4+5',
    manufacturer: 'Kano Marine Industries',
    location: 'Depo A - Bölüm 1',
    notes: 'Son muayene başarılı. Bir sonraki muayene tarihi: 09/2026',
    company: {
      name: 'Kano Marine',
      logo: '/logo.png'
    },
    updatedAt: '2024-01-15T10:30:00Z'
  }
}

interface PageProps {
  params: {
    hash: string
  }
}

export default function TubePage({ params }: PageProps) {
  const tube = mockTubeData[params.hash as keyof typeof mockTubeData]
  
  if (!tube) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-marine-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Tüp Bilgileri</h1>
                <p className="text-sm text-gray-500">QR Kod: {params.hash}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{tube.company.name}</p>
              <p className="text-xs text-gray-500">
                Son güncelleme: {new Date(tube.updatedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ana Bilgi Kartı */}
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {tube.tubeType} Tüpü
              </h2>
              <p className="text-lg text-gray-600">
                Seri No: <span className="font-semibold">{tube.serialNumber}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Aktif
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Weight className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ağırlık</p>
                <p className="font-semibold text-gray-900">{tube.weight} kg</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kapasite</p>
                <p className="font-semibold text-gray-900">{tube.capacity} L</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sıcaklık</p>
                <p className="font-semibold text-gray-900">{tube.temperature}°C</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Muayene</p>
                <p className="font-semibold text-gray-900">
                  {new Date(tube.inspectionDate).toLocaleDateString('tr-TR', { 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teknik Detaylar */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Teknik Özellikler
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Basınç:</span>
                <span className="font-medium">{tube.pressure} bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hacim:</span>
                <span className="font-medium">{tube.volume} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durum Kodları:</span>
                <span className="font-medium">{tube.statusCodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Üretici:</span>
                <span className="font-medium">{tube.manufacturer}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konum ve Durum
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Konum</p>
                  <p className="font-medium">{tube.location}</p>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">Notlar</p>
                <p className="text-sm text-gray-800">{tube.notes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Güvenlik Uyarısı */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-600 text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                Güvenlik Uyarısı
              </h4>
              <p className="text-sm text-yellow-700">
                Bu tüpü kullanmadan önce muayene tarihini kontrol edin. 
                Süresi geçmiş tüpleri kullanmayın. Güvenlik talimatlarına uyun.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-gray-500">
            Bu bilgiler {tube.company.name} tarafından sağlanmıştır.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sorun bildirmek için: info@kanomarine.com
          </p>
        </div>
      </main>
    </div>
  )
}
// Static params generation for export
export async function generateStaticParams() {
  // Mock data'dan tüm hash'leri döndür
  return Object.keys(mockTubeData).map((hash) => ({
    hash: hash,
  }))
}

// Metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const tube = mockTubeData[params.hash as keyof typeof mockTubeData]
  
  if (!tube) {
    return {
      title: 'Tüp Bulunamadı - KanoMarineQRSystem'
    }
  }

  return {
    title: `${tube.tubeType} Tüpü - ${tube.serialNumber} | KanoMarineQRSystem`,
    description: `${tube.tubeType} tüpü teknik bilgileri ve muayene durumu. Seri No: ${tube.serialNumber}`,
  }
}

