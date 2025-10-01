import { NextRequest, NextResponse } from 'next/server'

// In-memory database for Vercel deployment
// Note: This will reset on each deployment. For production, use a proper database.
let database = {
  tubes: [] as any[],
  settings: {
    version: '1.0.0',
    createdAt: new Date().toISOString()
  }
}

// Memory-based database operations
const readDatabase = () => {
  return database
}

const writeDatabase = (data: any) => {
  try {
    database = data
    return true
  } catch (error) {
    console.error('Veritabanı yazma hatası:', error)
    return false
  }
}

// GET - Tüm tüpleri listele
export async function GET() {
  try {
    const database = readDatabase()
    const tubes = database.tubes.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return NextResponse.json(tubes)
  } catch (error) {
    console.error('Veritabanı hatası:', error)
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

// POST - Yeni tüp ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // QR hash oluştur
    const qrHash = Date.now().toString(36) + Math.random().toString(36).substr(2)
    
    // Yeni tüp objesi oluştur
    const newTube = {
      id: Date.now(),
      serialNumber: data.serialNumber,
      tubeType: data.tubeType,
      weight: data.weight || null,
      capacity: data.capacity || null,
      inspectionDate: data.inspectionDate || null,
      temperature: data.temperature || null,
      pressure: data.pressure || null,
      manufacturer: data.manufacturer || null,
      notes: data.notes || null,
      qrHash,
      createdAt: new Date().toISOString()
    }
    
    // Veritabanından oku
    const database = readDatabase()
    
    // Yeni tüpü ekle
    database.tubes.push(newTube)
    
    // Veritabanına yaz
    const success = writeDatabase(database)
    
    if (!success) {
      throw new Error('Veritabanına yazma hatası')
    }
    
    return NextResponse.json({
      id: newTube.id,
      qrHash,
      qrUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tube/${qrHash}`
    })
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json({ error: 'Kayıt hatası' }, { status: 500 })
  }
}

// PUT - Tüp bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'Tüp ID gerekli' }, { status: 400 })
    }
    
    // Veritabanından oku
    const database = readDatabase()
    
    // Tüpü bul ve güncelle
    const tubeIndex = database.tubes.findIndex((tube: any) => tube.id === id)
    
    if (tubeIndex === -1) {
      return NextResponse.json({ error: 'Tüp bulunamadı' }, { status: 404 })
    }
    
    // Tüp bilgilerini güncelle
    database.tubes[tubeIndex] = {
      ...database.tubes[tubeIndex],
      serialNumber: updateData.serialNumber,
      tubeType: updateData.tubeType,
      weight: updateData.weight || null,
      capacity: updateData.capacity || null,
      inspectionDate: updateData.inspectionDate || null,
      temperature: updateData.temperature || null,
      pressure: updateData.pressure || null,
      manufacturer: updateData.manufacturer || null,
      notes: updateData.notes || null,
      updatedAt: new Date().toISOString()
    }
    
    // Veritabanına yaz
    const success = writeDatabase(database)
    
    if (!success) {
      throw new Error('Veritabanına yazma hatası')
    }
    
    return NextResponse.json({
      success: true,
      tube: database.tubes[tubeIndex],
      message: 'Tüp bilgileri başarıyla güncellendi'
    })
  } catch (error) {
    console.error('Güncelleme hatası:', error)
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
  }
}