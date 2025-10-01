'use client'
import { useState } from 'react'
import { QrCode, Download, Eye, Plus } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function HomePage() {
  const [formData, setFormData] = useState({
    tubeType: '',
    serialNumber: '',
    weight: '',
    capacity: '',
    inspectionDate: '',
    temperature: '',
    pressure: '',
    manufacturer: '',
    notes: ''
  })
  const [qrCode, setQrCode] = useState('')
  const [qrDataURL, setQrDataURL] = useState('')
  const [showQR, setShowQR] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateQRCode = async () => {
    try {
      // Önce tüp bilgilerini kaydet
      const tubeResponse = await fetch('/api/tubes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!tubeResponse.ok) {
        throw new Error('Tüp kaydedilemedi')
      }
      
      const tubeResult = await tubeResponse.json()
      const qrUrl = tubeResult.qrUrl
      
      // QR kod oluştur
      const qrResponse = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: qrUrl,
          options: {
            width: 256,
            margin: 2
          }
        })
      })
      
      if (!qrResponse.ok) {
        throw new Error('QR kod oluşturulamadı')
      }
      
      const qrResult = await qrResponse.json()
      
      setQrCode(qrUrl)
      setQrDataURL(qrResult.qrCode)
      setShowQR(true)
      console.log('Tüp başarıyla kaydedildi:', tubeResult)
    } catch (error) {
      console.error('Hata:', error)
      alert('QR kod oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    }
  }

  const downloadQR = () => {
    if (qrDataURL) {
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${formData.serialNumber || 'tube'}.png`
      downloadLink.href = qrDataURL
      downloadLink.click()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-marine-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KanoMarineQRSystem</h1>
                <p className="text-sm text-gray-500">Profesyonel Tüp Takip Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/qr-list'}
                className="btn-secondary"
              >
                <Eye className="w-4 h-4 mr-2" />
                Oluşturulan QR Kodları
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="text-gradient">QR Kod</span> Oluştur
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tüp bilgilerini girin ve anında QR kod oluşturun. 
            Oluşturulan QR kodu yazdırarak tüpe yapıştırabilirsiniz.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Plus className="w-5 h-5 text-marine-600" />
              <h2 className="text-xl font-semibold text-gray-900">Tüp Bilgileri</h2>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tubeType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tüp Tipi *
                  </label>
                  <select
                    id="tubeType"
                    name="tubeType"
                    value={formData.tubeType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="CO2">CO2</option>
                    <option value="O2">O2 (Oksijen)</option>
                    <option value="N2">N2 (Azot)</option>
                    <option value="Ar">Ar (Argon)</option>
                    <option value="He">He (Helyum)</option>
                    <option value="Acetylene">Asetilen</option>
                    <option value="Other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Seri Numarası *
                  </label>
                  <input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Örn: 2171007"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Ağırlık (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Örn: 45"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Kapasite (L)
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Örn: 250"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Muayene Tarihi
                  </label>
                  <input
                    type="month"
                    id="inspectionDate"
                    name="inspectionDate"
                    value={formData.inspectionDate}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="pressure" className="block text-sm font-medium text-gray-700 mb-2">
                    Basınç (bar)
                  </label>
                  <input
                    type="number"
                    id="pressure"
                    name="pressure"
                    value={formData.pressure}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Örn: 200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
                  Üretici
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Üretici firma adı"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Ek bilgiler, özel notlar..."
                />
              </div>

              <button
                type="button"
                onClick={generateQRCode}
                disabled={!formData.tubeType || !formData.serialNumber}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCode className="w-5 h-5 mr-2" />
                QR Kod Oluştur
              </button>
            </form>
          </div>

          {/* QR Code Display */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">QR Kod</h2>
            
            {!showQR ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Tüp bilgilerini doldurun ve QR kod oluşturun
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div id="qr-code" className="inline-block p-6 bg-white rounded-lg shadow-sm border">
                  {qrDataURL ? (
                    <img 
                      src={qrDataURL} 
                      alt="QR Code" 
                      className="w-52 h-52 mx-auto"
                    />
                  ) : (
                    <QRCodeSVG
                      value={qrCode}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  )}
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">QR Kod URL:</p>
                    <p className="break-all bg-gray-50 p-2 rounded text-xs">{qrCode}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={downloadQR}
                      className="btn-secondary flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PNG İndir
                    </button>
                    <button
                      onClick={() => window.open(qrCode, '_blank')}
                      className="btn-primary flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Önizleme
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
