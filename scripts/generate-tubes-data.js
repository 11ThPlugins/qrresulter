#!/usr/bin/env node

/**
 * Kano Marine QR System - Tüp Verisi Üretici
 * 
 * Bu script mevcut veritabanından tüp verilerini alır ve 
 * GitHub Pages için JSON dosyası oluşturur.
 */

const fs = require('fs');
const path = require('path');

// Veritabanı dosyası yolu
const DB_FILE = path.join(__dirname, '..', 'tubes.db');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'tubes-data.json');

// SQLite3 modülünü kontrol et
let sqlite3;
try {
    sqlite3 = require('sqlite3').verbose();
} catch (error) {
    console.error('❌ SQLite3 modülü bulunamadı. Lütfen yükleyin: npm install sqlite3');
    process.exit(1);
}

/**
 * Veritabanından tüp verilerini oku
 */
function readTubesFromDatabase() {
    return new Promise((resolve, reject) => {
        // Veritabanı dosyası var mı kontrol et
        if (!fs.existsSync(DB_FILE)) {
            console.log('⚠️  SQLite veritabanı bulunamadı, API\'den veri çekmeye çalışılıyor...');
            resolve([]);
            return;
        }

        const db = new sqlite3.Database(DB_FILE);
        
        const query = `
            SELECT 
                id,
                qr_hash as qrHash,
                tube_type as tubeType,
                serial_number as serialNumber,
                weight,
                capacity,
                pressure,
                volume,
                inspection_date as inspectionDate,
                next_inspection_date as nextInspectionDate,
                last_service_date as lastServiceDate,
                temperature,
                humidity,
                status_codes as statusCodes,
                current_status as currentStatus,
                manufacturer,
                model,
                year_manufactured as yearManufactured,
                location,
                notes,
                created_at as createdAt,
                updated_at as updatedAt
            FROM tubes 
            WHERE current_status = 'active'
            ORDER BY updated_at DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            db.close();
            resolve(rows);
        });
    });
}

/**
 * API'den tüp verilerini oku (fallback)
 */
async function readTubesFromAPI() {
    try {
        // Next.js API route'undan veri çek
        const apiFile = path.join(__dirname, '..', 'app', 'api', 'tubes', 'route.ts');
        
        if (!fs.existsSync(apiFile)) {
            console.log('⚠️  API route dosyası bulunamadı');
            return [];
        }

        // API dosyasını oku ve in-memory database'i çıkar
        const apiContent = fs.readFileSync(apiFile, 'utf8');
        
        // Basit regex ile database objesini bul (production için daha güvenli yöntem kullanılmalı)
        const dbMatch = apiContent.match(/let database = ({[\s\S]*?})/);
        
        if (dbMatch) {
            // Bu kısım güvenlik riski taşır, sadece development için
            console.log('⚠️  API\'den veri çıkarma deneniyor (güvenli değil)...');
            return [];
        }

        return [];
    } catch (error) {
        console.error('API\'den veri okuma hatası:', error.message);
        return [];
    }
}

/**
 * Tüp verilerini JSON formatına dönüştür
 */
function transformTubesData(tubes) {
    const transformedData = {};

    tubes.forEach(tube => {
        // QR hash'i key olarak kullan
        const key = tube.qrHash || tube.id;
        
        transformedData[key] = {
            id: tube.id,
            qrHash: tube.qrHash,
            tubeType: tube.tubeType,
            serialNumber: tube.serialNumber,
            weight: tube.weight,
            capacity: tube.capacity,
            pressure: tube.pressure,
            volume: tube.volume,
            inspectionDate: tube.inspectionDate,
            nextInspectionDate: tube.nextInspectionDate,
            lastServiceDate: tube.lastServiceDate,
            temperature: tube.temperature,
            humidity: tube.humidity,
            statusCodes: tube.statusCodes,
            currentStatus: tube.currentStatus || 'active',
            manufacturer: tube.manufacturer,
            model: tube.model,
            yearManufactured: tube.yearManufactured,
            location: tube.location,
            notes: tube.notes,
            createdAt: tube.createdAt,
            updatedAt: tube.updatedAt
        };
    });

    return transformedData;
}

/**
 * Demo veri oluştur
 */
function createDemoData() {
    return {
        "demo123": {
            id: "demo123",
            qrHash: "demo123",
            tubeType: "CO2",
            serialNumber: "2171007",
            weight: 45,
            capacity: 250,
            pressure: 79.6,
            volume: 124.8,
            inspectionDate: "2025-09-01",
            nextInspectionDate: "2026-09-01",
            temperature: 18,
            statusCodes: "2+3+4+5",
            currentStatus: "active",
            manufacturer: "Kano Marine Industries",
            model: "KM-CO2-250",
            yearManufactured: 2023,
            location: "Depo A - Bölüm 1",
            notes: "Son muayene başarılı. Bir sonraki muayene tarihi: 09/2026",
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z"
        },
        "abc456": {
            id: "abc456",
            qrHash: "abc456",
            tubeType: "Oksijen",
            serialNumber: "OX-2024-001",
            weight: 35,
            capacity: 200,
            pressure: 150.0,
            volume: 200.0,
            inspectionDate: "2025-08-15",
            nextInspectionDate: "2026-08-15",
            temperature: 20,
            statusCodes: "1+2+3",
            currentStatus: "active",
            manufacturer: "Kano Marine Industries",
            model: "KM-O2-200",
            yearManufactured: 2024,
            location: "Depo B - Bölüm 2",
            notes: "Yeni tüp, ilk muayene tamamlandı.",
            createdAt: "2024-08-15T14:20:00Z",
            updatedAt: "2024-08-15T14:20:00Z"
        }
    };
}

/**
 * Ana fonksiyon
 */
async function main() {
    try {
        console.log('🚀 Tüp verisi üretimi başlatılıyor...');

        // Docs klasörünü oluştur
        const docsDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
            console.log('📁 docs klasörü oluşturuldu');
        }

        let tubes = [];

        // Önce veritabanından okumaya çalış
        try {
            tubes = await readTubesFromDatabase();
            console.log(`📊 Veritabanından ${tubes.length} tüp verisi okundu`);
        } catch (error) {
            console.log('⚠️  Veritabanı okuma hatası:', error.message);
            
            // API'den okumaya çalış
            tubes = await readTubesFromAPI();
            console.log(`📊 API'den ${tubes.length} tüp verisi okundu`);
        }

        // Eğer veri yoksa demo veri kullan
        let tubesData;
        if (tubes.length === 0) {
            console.log('⚠️  Veri bulunamadı, demo veri kullanılıyor');
            tubesData = createDemoData();
        } else {
            tubesData = transformTubesData(tubes);
        }

        // JSON dosyasını yaz
        const jsonContent = JSON.stringify(tubesData, null, 2);
        fs.writeFileSync(OUTPUT_FILE, jsonContent, 'utf8');

        console.log(`✅ Tüp verisi başarıyla oluşturuldu: ${OUTPUT_FILE}`);
        console.log(`📈 Toplam ${Object.keys(tubesData).length} tüp verisi işlendi`);

        // İstatistikler
        const stats = {
            totalTubes: Object.keys(tubesData).length,
            tubeTypes: [...new Set(Object.values(tubesData).map(t => t.tubeType))],
            lastUpdated: new Date().toISOString()
        };

        console.log('📊 İstatistikler:');
        console.log(`   - Toplam tüp: ${stats.totalTubes}`);
        console.log(`   - Tüp tipleri: ${stats.tubeTypes.join(', ')}`);
        console.log(`   - Son güncelleme: ${stats.lastUpdated}`);

        // Stats dosyası oluştur
        const statsFile = path.join(docsDir, 'stats.json');
        fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');

    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

// Script çalıştırıldığında
if (require.main === module) {
    main();
}

module.exports = { main, transformTubesData, createDemoData };
