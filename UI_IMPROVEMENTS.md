# UI Improvements - Info Tooltips

## Problem Fixed
1. **Overlapping text** - "Rp" label was overlapping with numbers
2. **No user guidance** - Users didn't understand technical terms like "system cost per kWp"

## Solution: InfoTooltip Component

Created a new `InfoTooltip` component that provides:
- **❓ Info button** (i icon) next to each input label
- **Detailed explanation** of what the parameter means
- **💡 Tips** section with practical advice for Indonesian users
- **Bilingual support** (Indonesian/English)

## Features

### Visual Design
- Small circular (i) button next to labels
- Hover state with orange color
- Modal-style tooltip with backdrop
- Smooth animations (scale + fade)
- Right-aligned positioning to avoid overflow

### Content Structure
Each tooltip includes:
1. **Title** - Clear parameter name
2. **Description** - Simple explanation in plain language
3. **Tips** - 3-4 bullet points with practical advice

## Examples

### Tilt (Kemiringan)
**ID:** "Sudut kemiringan atap dari horizontal. Atap datar = 0°, atap tegak = 90°."
**Tips:**
- Gunakan aplikasi kompas di HP untuk mengukur
- Atap miring biasanya 15-30°
- Semakin miring, semakin bagus untuk membersihkan debu

### Azimuth (Arah Hadap)
**ID:** "Arah atap menghadap. 0° = Utara, 90° = Timur, 180° = Selatan, 270° = Barat."
**Tips:**
- Buka Google Maps, cari rumah Anda
- Lihat arah utara (↑) di peta
- Arah atap menghadap ke mana dari utara?

### Panel Efficiency (Efisiensi Panel)
**ID:** "Persentase energi matahari yang dikonversi menjadi listrik. Panel modern biasanya 18-22%."
**Tips:**
- Biarkan default (20%) jika tidak yakin
- Lebih tinggi = lebih mahal tapi lebih hemat tempat
- Panel premium bisa sampai 25%

### System Cost (Biaya Sistem)
**ID:** "Total biaya untuk membeli dan memasang panel surya per kilowatt-peak (kWp), termasuk panel, inverter, instalasi, dan perizinan."
**Tips:**
- Biarkan default (Rp 15jt) jika belum dapat penawaran
- Minta penawaran dari 2-3 instalator
- Harga 2024: Rp 12-18jt/kWp untuk rumah
- Termasuk panel, inverter, instalasi, izin

### Electricity Tariff (Tarif Listrik)
**ID:** "Harga listrik per kWh yang Anda bayar ke PLN. Cek di tagihan atau aplikasi PLN Mobile."
**Tips:**
- PLN R1 (rumah 450VA-2200VA): ~Rp 1.445/kWh
- Cek di aplikasi PLN Mobile → Tagihan
- Tarif bisa berbeda per daerah

## Technical Details

### Component Structure
```tsx
interface InfoTooltipProps {
  title: string              // Parameter name
  description: string        // What it is
  tips?: string[]          // Practical advice
  language: 'id' | 'en'  // For bilingual
}
```

### Usage in Sidebar
```tsx
<div className="flex items-center gap-2">
  <span className="text-gray-300">Kemiringan</span>
  <InfoTooltip
    title="Kemiringan Atap"
    description="Sudut kemiringan atap dari horizontal..."
    tips={['Tip 1', 'Tip 2', 'Tip 3']}
    language="id"
  />
</div>
```

### Input Field Improvements
Changed all input fields to:
```tsx
// BEFORE (overlapping)
<div className="relative">
  <span className="absolute left-4">Rp</span>
  <input className="pl-12 ... />  {/* Not enough space! */}
</div>

// AFTER (no overlap)
<div className="relative">
  <span className="absolute left-4">Rp</span>
  <input className="pl-16 ... />  {/* More space for "Rp" */}
</div>
```

## Build Status
✅ TypeScript compilation passed
✅ All components integrated
✅ No layout issues

## Result
- **No more overlapping text**
- **Every input has helpful info button**
- **Indonesian users get practical tips**
- **Clean, professional UI**

## Files Modified
- `frontend/src/components/ui/InfoTooltip.tsx` (NEW)
- `frontend/src/components/layout/Sidebar.tsx` (UPDATED)
  - Added InfoTooltip to all 6 inputs
  - Fixed padding on all number inputs
  - Added comprehensive Indonesian/English descriptions