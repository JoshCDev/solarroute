import { create } from 'zustand'

export type Language = 'id' | 'en'

type TranslationKey = keyof typeof translations.id

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  tArray: (key: TranslationKey) => string[]
}

const translations = {
id: {
    // Landing Page
    'hero.title': 'Hitung Potensi Solar Rumah Anda',
    'hero.subtitle': 'Tahu berapa hemat listrik & uang dengan panel surya dalam 2 menit',
    'hero.cta': 'Mulai Hitung Gratis',
    'hero.trusted': 'Telah dipercaya ribuan pemilik rumah di Indonesia',

    // How It Works
    'how.title': 'Cara Kerja',
    'how.step1.title': '1. Tentukan Lokasi',
    'how.step1.desc': 'Cari alamat rumah atau gunakan lokasi saat ini',
    'how.step2.title': '2. Gambar Atap',
    'how.step2.desc': 'Klik di peta untuk menggambar area atap rumah Anda',
    'how.step3.title': '3. Lihat Hasil',
    'how.step3.desc': 'Dapatkan estimasi penghematan listrik & biaya instalasi',

    // Main App
    'app.title': 'Kalkulator Solar',
    'app.drawRoof': 'Gambar Area Atap',
    'app.drawing': 'Sedang Menggambar...',
    'app.done': 'Selesai',
    'app.cancel': 'Batal',
    'app.undo': 'Undo',
    'app.clear': 'Hapus',
    'app.myLocation': 'Lokasi Saya',
    'app.search': 'Cari alamat...',
    'app.calculating': 'MENGHITUNG...',
    'app.calculatingDesc': 'Analisis data cuaca & potensi atap',

    // Sidebar
    'sidebar.title': 'Konfigurasi',
    'sidebar.closePanel': 'Tutup panel',
    'sidebar.openPanel': 'Buka panel konfigurasi',
    'sidebar.roofArea': 'Area Atap',
    'sidebar.points': 'titik',
    'sidebar.notDrawn': 'Belum digambar',
    'sidebar.roofSettings': 'Pengaturan Atap',
    'sidebar.tilt': 'Kemiringan',
    'sidebar.tiltHelp': 'Sudut kemiringan atap dari horizontal',
    'sidebar.tiltTips': ['Gunakan aplikasi kompas di HP', 'Atap biasanya 15-30°'],
    'sidebar.azimuth': 'Arah Hadap',
    'sidebar.azimuthHelp': 'Arah atap menghadap. 0°=Utara, 180°=Selatan.',
    'sidebar.azimuthTips': ['Buka Google Maps', 'Lihat arah utara'],
    'sidebar.electricity': 'Tagihan Listrik',
    'sidebar.monthlyBill': 'Per Bulan',
    'sidebar.billHelp': 'Rata-rata tagihan listrik bulanan Anda',
    'sidebar.billTips': ['Cek PLN Mobile', 'Hitung rata-rata'],
    'sidebar.advanced': '⚙️ Pengaturan Lanjutan',
    'sidebar.panelEfficiency': 'Efisiensi Panel',
    'sidebar.efficiencyHelp': 'Persentase energi matahari yang dikonversi.',
    'sidebar.efficiencyTips': ['Biarkan default (20%)', 'Lebih tinggi = lebih mahal'],
    'sidebar.systemCost': 'Biaya Sistem',
    'sidebar.costHelp': 'Total biaya instalasi per kWp.',
    'sidebar.costTips': ['Biarkan default Rp 15jt', 'Minta penawaran 2-3 instalator'],
    'sidebar.electricityTariff': 'Tarif Listrik',
    'sidebar.tariffHelp': 'Harga listrik per kWh.',
    'sidebar.tariffTips': ['PLN R1: ~Rp 1.445/kWh', 'Cek di PLN Mobile'],
    'sidebar.calculate': 'HITUNG POTENSI',
    'sidebar.needArea': 'Gambar area atap minimal 3 titik',
    'sidebar.needBill': 'Masukkan tagihan listrik',
    'sidebar.addArea': 'Tambah Area',
    'sidebar.drawArea': 'Gambar Area Atap',

    // Results
    'results.title': 'Hasil Analisis',
    'results.close': 'Tutup hasil',
    'results.downloadPdf': 'Unduh PDF',
    'results.downloadPdfAria': 'Unduh laporan PDF',
    'results.dailyEnergy': 'Produksi per Hari',
    'results.annualEnergy': 'Produksi per Tahun',
    'results.year': 'tahun',
    'results.systemSize': 'Ukuran Sistem',
    'results.roofArea': 'Luas Atap',
    'results.yearlySavings': 'Hemat/Tahun',
    'results.payback': 'Balik Modal',
    'results.years': 'thn',
    'results.systemCost': 'Estimasi Biaya',
    'results.systemCostDesc': 'Include panel, inverter, instalasi & perizinan',
    'results.co2': 'Pengurangan CO₂',
    'results.trees': 'setara pohon/tahun',
    'results.monthlyChart': 'Produksi Bulanan',
    'results.peak': 'Peak:',
    'results.lowest': 'Lowest:',
    'results.losses': 'Detail Kerugian',
    'results.temperature': 'Suhu',
    'results.soiling': 'Kotoran',
    'results.wiring': 'Kabel',
    'results.inverter': 'Inverter',
    'results.orientation': 'Orientasi',
    'results.totalDcLoss': 'Total DC Loss',
    'results.panelLayout': 'Layout Panel',
    'results.totalPanels': 'Panel',
    'results.rows': 'Baris',
    'results.columns': 'Kolom',
    'results.coverage': 'Coverage:',
    'results.dimensions': 'Dimensi:',
    'results.recalculate': 'Hitung Ulang',
    'results.downloading': 'Mengunduh...',
    'results.pdfSuccess': 'PDF berhasil diunduh!',
    'results.dataSource': 'Data:',

    // Map
    'map.drawingMode': 'KLIK LANGSUNG DI PETA',
    'map.clickRoofCorners': 'Klik di sudut-sudut atap Anda',
    'map.searchPlaceholder': 'Cari alamat rumah...',
    'map.search': 'Cari lokasi',
    'map.useMyLocation': 'Gunakan lokasi saya',
    'map.startDrawing': 'Mulai menggambar area atap',
    'map.clearArea': 'Hapus area yang digambar',
    'map.undoPoint': 'Hapus titik terakhir',
    'map.finishDrawing': 'Selesai menggambar',
    'map.done': 'Selesai',
    'map.pts': 'titik',
    'map.calculateReady': '✓ SIAP DIHITUNG',
    'map.hasPoints': '⏳ {count} TITIK',
    'map.noArea': '⏳ BELUM ADA AREA',
    'map.tipSearch': '💡 Cari lokasi rumah Anda',
    'map.tipDrawing': '💡 Klik langsung di sudut-sudut atap',
    'map.tipAdd': '💡 Tambah {count} titik lagi',
    'map.tipCalculate': '✓ {count} titik - Klik Hitung Potensi',

    // Toast
    'toast.dismiss': 'Tutup notifikasi',

    // Tips
    'tip.south': '💡 Atap menghadap Selatan (180°) ideal untuk Indonesia',
    'tip.tilt': '💡 Kemiringan 15-30° optimal untuk daerah tropis',
    'tip.shade': '💡 Hindari area yang terkena bayangan pohon/bangunan',

    // Errors
    'error.need3Points': 'Minimal 3 titik untuk membentuk area',
    'error.calculation': 'Gagal menghitung. Silakan coba lagi.',
    'error.location': 'Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.',
    'error.drawRoof': 'Gambar area atap minimal 3 titik',
    'error.enterBill': 'Masukkan tagihan listrik',
    'error.locationNotFound': 'Lokasi tidak ditemukan',
    'error.noGeolocation': 'Browser tidak support geolocation',
    'error.failedLocation': 'Gagal mendapatkan lokasi',
    'error.locationFound': 'Lokasi ditemukan!',
    'error.calculationComplete': 'Perhitungan selesai!',
    'error.drawModeActive': 'Mode gambar aktif - Klik di peta!',
    'error.areaComplete': 'Area selesai! ({count} titik)',
  },
en: {
    // Landing Page
    'hero.title': 'Calculate Your Home Solar Potential',
    'hero.subtitle': 'Know your electricity savings & costs with solar panels in 2 minutes',
    'hero.cta': 'Start Free Calculation',
    'hero.trusted': 'Trusted by thousands of homeowners in Indonesia',

    // How It Works
    'how.title': 'How It Works',
    'how.step1.title': '1. Set Location',
    'how.step1.desc': 'Search your address or use current location',
    'how.step2.title': '2. Draw Roof',
    'how.step2.desc': 'Click on map to draw your roof area',
    'how.step3.title': '3. See Results',
    'how.step3.desc': 'Get electricity savings & installation cost estimates',

    // Main App
    'app.title': 'Solar Calculator',
    'app.drawRoof': 'Draw Roof Area',
    'app.drawing': 'Drawing...',
    'app.done': 'Done',
    'app.cancel': 'Cancel',
    'app.undo': 'Undo',
    'app.clear': 'Clear',
    'app.myLocation': 'My Location',
    'app.search': 'Search address...',
    'app.calculating': 'CALCULATING...',
    'app.calculatingDesc': 'Analyzing weather data & roof potential',

    // Sidebar
    'sidebar.title': 'Configuration',
    'sidebar.closePanel': 'Close panel',
    'sidebar.openPanel': 'Open configuration panel',
    'sidebar.roofArea': 'Roof Area',
    'sidebar.points': 'points',
    'sidebar.notDrawn': 'Not drawn yet',
    'sidebar.roofSettings': 'Roof Settings',
    'sidebar.tilt': 'Tilt',
    'sidebar.tiltHelp': 'Roof angle from horizontal',
    'sidebar.tiltTips': ['Use compass app', 'Typical 15-30°'],
    'sidebar.azimuth': 'Direction',
    'sidebar.azimuthHelp': 'Direction roof faces. 0°=North, 180°=South.',
    'sidebar.azimuthTips': ['Open Google Maps', 'Look at north direction'],
    'sidebar.electricity': 'Electricity Bill',
    'sidebar.monthlyBill': 'Monthly',
    'sidebar.billHelp': 'Your average monthly electricity bill',
    'sidebar.billTips': ['Check PLN Mobile', 'Calculate average'],
    'sidebar.advanced': '⚙️ Advanced Settings',
    'sidebar.panelEfficiency': 'Panel Efficiency',
    'sidebar.efficiencyHelp': 'Percentage of sunlight converted.',
    'sidebar.efficiencyTips': ['Leave default (20%)', 'Higher = more expensive'],
    'sidebar.systemCost': 'System Cost',
    'sidebar.costHelp': 'Total installation cost per kWp.',
    'sidebar.costTips': ['Leave default IDR 15M', 'Get 2-3 quotes'],
    'sidebar.electricityTariff': 'Electricity Tariff',
    'sidebar.tariffHelp': 'Price per kWh you pay.',
    'sidebar.tariffTips': ['PLN R1: ~IDR 1,445/kWh', 'Check PLN Mobile'],
    'sidebar.calculate': 'CALCULATE POTENTIAL',
    'sidebar.needArea': 'Draw roof area with at least 3 points',
    'sidebar.needBill': 'Please enter electricity bill',
    'sidebar.addArea': 'Add Area',
    'sidebar.drawArea': 'Draw Roof Area',

    // Results
    'results.title': 'Analysis Results',
    'results.close': 'Close results',
    'results.downloadPdf': 'Download PDF',
    'results.downloadPdfAria': 'Download PDF report',
    'results.dailyEnergy': 'Daily Production',
    'results.annualEnergy': 'Annual Production',
    'results.year': 'year',
    'results.systemSize': 'System Size',
    'results.roofArea': 'Roof Area',
    'results.yearlySavings': 'Savings/Year',
    'results.payback': 'Payback Period',
    'results.years': 'years',
    'results.systemCost': 'Est. System Cost',
    'results.systemCostDesc': 'Include panel, inverter, installation & permits',
    'results.co2': 'CO₂ Reduction',
    'results.trees': 'equivalent trees/year',
    'results.monthlyChart': 'Monthly Production',
    'results.peak': 'Peak:',
    'results.lowest': 'Lowest:',
    'results.losses': 'Detailed Losses',
    'results.temperature': 'Temperature',
    'results.soiling': 'Soiling',
    'results.wiring': 'Wiring',
    'results.inverter': 'Inverter',
    'results.orientation': 'Orientation',
    'results.totalDcLoss': 'Total DC Loss',
    'results.panelLayout': 'Panel Layout',
    'results.totalPanels': 'Panels',
    'results.rows': 'Rows',
    'results.columns': 'Columns',
    'results.coverage': 'Coverage:',
    'results.dimensions': 'Dimensions:',
    'results.recalculate': 'Recalculate',
    'results.downloading': 'Downloading...',
    'results.pdfSuccess': 'PDF downloaded successfully!',
    'results.dataSource': 'Data:',

    // Map
    'map.drawingMode': 'CLICK DIRECTLY ON MAP',
    'map.clickRoofCorners': 'Click on your roof corners',
    'map.searchPlaceholder': 'Search house address...',
    'map.search': 'Search location',
    'map.useMyLocation': 'Use my location',
    'map.startDrawing': 'Start drawing roof area',
    'map.clearArea': 'Clear drawn area',
    'map.undoPoint': 'Undo last point',
    'map.finishDrawing': 'Finish drawing',
    'map.done': 'Done',
    'map.pts': 'pts',
    'map.calculateReady': '✓ READY TO CALCULATE',
    'map.hasPoints': '⏳ {count} PTS',
    'map.noArea': '⏳ NO AREA YET',
    'map.tipSearch': '💡 Search your house location',
    'map.tipDrawing': '💡 Click directly on roof corners',
    'map.tipAdd': '💡 Add {count} more points',
    'map.tipCalculate': '✓ {count} points - Click Calculate Potential',

    // Toast
    'toast.dismiss': 'Dismiss notification',

    // Tips
    'tip.south': '💡 South-facing (180°) roofs are ideal for Indonesia',
    'tip.tilt': '💡 15-30° tilt is optimal for tropical regions',
    'tip.shade': '💡 Avoid areas shaded by trees/buildings',

    // Errors
    'error.need3Points': 'Need at least 3 points to form an area',
    'error.calculation': 'Calculation failed. Please try again.',
    'error.location': 'Failed to get location. Please enable location permission.',
    'error.drawRoof': 'Draw roof area with at least 3 points',
    'error.enterBill': 'Please enter electricity bill',
    'error.locationNotFound': 'Location not found',
    'error.noGeolocation': 'Browser does not support geolocation',
    'error.failedLocation': 'Failed to get location',
    'error.locationFound': 'Location found!',
    'error.calculationComplete': 'Calculation complete!',
    'error.drawModeActive': 'Drawing mode - Click on map!',
    'error.areaComplete': 'Area complete! ({count} points)',
  }
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'id', // Default to Indonesian
  
  setLanguage: (language) => set({ language }),
  
  t: (key: TranslationKey) => {
    const { language } = get()
    const value = translations[language][key]
    return Array.isArray(value) ? value.join(', ') : (value || key)
  },
  
  tArray: (key: TranslationKey) => {
    const { language } = get()
    const value = translations[language][key]
    return Array.isArray(value) ? value : []
  }
}))
