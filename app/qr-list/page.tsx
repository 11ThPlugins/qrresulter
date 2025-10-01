'use client'
import { useState, useEffect } from 'react'
import { QrCode, ArrowLeft, Eye, Download, Edit, Save, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface TubeRecord {
  id: number
  serialNumber: string
  tubeType: string
  weight?: number
  capacity?: number
  inspectionDate?: string
  temperature?: number
  pressure?: number
  manufacturer?: string
  notes?: string
  qrHash: string
  createdAt: string
}

export default function QRListPage() {
  const [tubes, setTubes] = useState<TubeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTube, setSelectedTube] = useState<TubeRecord | null>(null)
  const [editingTube, setEditingTube] = useState<TubeRecord | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<TubeRecord>>({})

  useEffect(() => {
    const fetchTubes = async () => {
      try {
        const response = await fetch('/api/tubes')
        if (response.ok) {
          const data = await response.json()
          setTubes(data)
        } else {
          console.error('Veri çekme hatası:', response.statusText)
        }
      } catch (error) {
        console.error('Bağlantı hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTubes()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadQR = (tube: TubeRecord) => {
    const qrUrl = `${window.location.origin}/tube/${tube.qrHash}`
    
    // QR kod oluştur ve indir
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 300
    canvas.height = 300
    
    // SVG oluştur
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '300')
    svg.setAttribute('height', '300')
    
    // QR kod için geçici div oluştur
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)
    
    // QR kodu render et ve indir
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(qrUrl, { width: 300 }, (err: any, url: string) => {
        if (!err) {
          const downloadLink = document.createElement('a')
          downloadLink.download = `qr-${tube.serialNumber}.png`
          downloadLink.href = url
          downloadLink.click()
        }
      })
    })
    
    document.body.removeChild(tempDiv)
  }

  const startEdit = (tube: TubeRecord) => {
    setEditingTube(tube)
    setEditFormData({
      tubeType: tube.tubeType,
      serialNumber: tube.serialNumber,
      weight: tube.weight,
      capacity: tube.capacity,
      inspectionDate: tube.inspectionDate,
      temperature: tube.temperature,
      pressure: tube.pressure,
      manufacturer: tube.manufacturer,
      notes: tube.notes
    })
  }

  const cancelEdit = () => {
    setEditingTube(null)
    setEditFormData({})
  }

  const saveEdit = async () => {
    if (!editingTube) return

    try {
      const response = await fetch('/api/tubes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTube.id,
          ...editFormData
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Tubes listesini güncelle
        setTubes(tubes.map(tube => 
          tube.id === editingTube.id ? result.tube : tube
        ))
        setEditingTube(null)
        setEditFormData({})
        alert('Tüp bilgileri başarıyla güncellendi!')
      } else {
        const error = await response.json()
        alert(`Güncelleme hatası: ${error.error}`)
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('Bağlantı hatası! Lütfen tekrar deneyin.')
    }
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfa</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-marine-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Oluşturulan QR Kodları</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oluşturulan QR Kodları
          </h1>
          <p className="text-gray-600">
            Daha önce oluşturduğunuz tüp QR kodlarını görüntüleyin
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marine-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Yükleniyor...</p>
          </div>
        ) : tubes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz QR kod oluşturulmamış
            </h3>
            <p className="text-gray-500 mb-6">
              İlk QR kodunuzu oluşturmak için ana sayfaya gidin
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              QR Kod Oluştur
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tubes.map((tube) => (
              <div key={tube.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-marine-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-marine-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Seri No: {tube.serialNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {tube.tubeType} • {formatDate(tube.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(tube)}
                      className="btn-secondary text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => setSelectedTube(tube)}
                      className="btn-secondary text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Görüntüle
                    </button>
                    <button
                      onClick={() => downloadQR(tube)}
                      className="btn-primary text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      İndir
                    </button>
                    <button
                      onClick={() => window.open(`/tube/${tube.qrHash}`, '_blank')}
                      className="btn-secondary text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Aç
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Kod Modal */}
        {selectedTube && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  QR Kod - {selectedTube.serialNumber}
                </h3>
                
                <div className="inline-block p-4 bg-gray-50 rounded-lg mb-4">
                  <QRCodeSVG
                    value={`${window.location.origin}/tube/${selectedTube.qrHash}`}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                
                <div className="text-sm text-gray-600 mb-6">
                  <p><strong>Tüp Tipi:</strong> {selectedTube.tubeType}</p>
                  <p><strong>Oluşturulma:</strong> {formatDate(selectedTube.createdAt)}</p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedTube(null)}
                    className="btn-secondary flex-1"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => downloadQR(selectedTube)}
                    className="btn-primary flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Düzenleme Modal */}
        {editingTube && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tüp Bilgilerini Düzenle - {editingTube.serialNumber}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tüp Tipi *
                    </label>
                    <select
                      name="tubeType"
                      value={editFormData.tubeType || ''}
                      onChange={handleEditInputChange}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seri Numarası *
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={editFormData.serialNumber || ''}
                      onChange={handleEditInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ağırlık (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={editFormData.weight || ''}
                      onChange={handleEditInputChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapasite (L)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={editFormData.capacity || ''}
                      onChange={handleEditInputChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Muayene Tarihi
                    </label>
                    <input
                      type="month"
                      name="inspectionDate"
                      value={editFormData.inspectionDate || ''}
                      onChange={handleEditInputChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Basınç (bar)
                    </label>
                    <input
                      type="number"
                      name="pressure"
                      value={editFormData.pressure || ''}
                      onChange={handleEditInputChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Üretici
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={editFormData.manufacturer || ''}
                    onChange={handleEditInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    value={editFormData.notes || ''}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn-secondary flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={!editFormData.tubeType || !editFormData.serialNumber}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
