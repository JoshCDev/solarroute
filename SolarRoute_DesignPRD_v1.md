# UI/UX Product Requirements Document: SolarRoute
**Project Name:** SolarRoute  
**Design Codename:** "Eclipse Fluidity"  
**Version:** 1.0 (MVP)  
**Date:** February 9, 2026  
**Status:** Approved for Design & Dev  
**Author:** Chief System Architect & Solar Energy Specialist

---

## 1. Executive Summary
**SolarRoute** bukan sekadar alat hitung, melainkan sebuah dashboard saintifik futuristik. Desain antarmuka (UI) dan pengalaman pengguna (UX) akan meninggalkan estetika konvensional "Eco-Green" dan beralih ke tema **"Solar Eclipse"** (Gerhana Matahari).

Tujuannya adalah menciptakan atmosfer yang *immersive*, presisi, dan premium menggunakan gaya *Liquid Glass* dan *Modern Gradients*, merujuk pada standar desain interaktif modern seperti **reactbits.dev** dan **Linear.app**.

---

## 2. Design Philosophy & Visual Concept

### 2.1. Core Concept: "Capturing the Light in Darkness"
* **Atmosphere:** Gelap, dalam, dan misterius (Deep Space), namun diterangi oleh data yang "menyala" (Solar Energy).
* **Texture Strategy:** Menggabungkan *Glassmorphism* (kaca buram), *Liquid Distortion* (cairan), dan *Noise Overlay* untuk memberikan tekstur taktil agar tidak terlihat datar.
* **Motion Principle:** *Fluid & Organic*. Interaksi elemen tidak boleh kaku (linear); harus menggunakan kurva animasi yang luwes (*spring physics*).

### 2.2. Color Palette: "The Eclipse System"
Warna diambil dari fenomena korona matahari saat gerhana total.

| Role | Color Name | Hex Code | Usage Context |
| :--- | :--- | :--- | :--- |
| **Background** | **Void Black** | `#050505` | Latar belakang utama (Deep Space). |
| **Surface** | **Dark Matter** | `#0A0A0A` | Latar belakang panel sekunder. |
| **Primary** | **Solar Flare** | `#FF4D00` | Warna utama untuk Brand, CTA, dan Highlight. |
| **Gradient** | **Eclipse Mesh** | `#FF4D00` → `#D91E18` | Gradient untuk tombol dan grafis. |
| **Secondary** | **Magma Red** | `#D91E18` | Indikator Error atau Heatmap intensitas tinggi. |
| **Success** | **Profit Green** | `#00FF94` | **Khusus** untuk angka uang/penghematan (Neon Green). |
| **Text** | **Corona White** | `#FFFFFF` | Heading dan Teks Utama. |
| **Text Muted** | **Stardust** | `#888888` | Label sekunder atau instruksi. |
| **Glass** | **Frosted Layer** | `rgba(255, 255, 255, 0.03)` | Base layer untuk kartu/panel. |
| **Border** | **Rim Light** | `rgba(255, 255, 255, 0.1)` | Border tipis 1px. |

---

## 3. Typography System
Pemilihan font bertujuan menyeimbangkan estetika futuristik dengan keterbacaan data sains.

* **Headings (Display):** `Space Grotesk` atau `Clash Display`.
    * *Karakteristik:* Geometris, sedikit eksentrik, futuristik.
* **Body Text (UI):** `Inter` atau `Plus Jakarta Sans`.
    * *Karakteristik:* Bersih, mudah dibaca di ukuran kecil.
* **Data & Numbers:** `JetBrains Mono` atau `Geist Mono`.
    * *Karakteristik:* Monospaced. Wajib digunakan untuk semua angka hasil kalkulasi (kWh, Rp, Luas Area) agar terlihat presisi seperti instrumen kokpit.

---

## 4. Component Specifications (ReactBits Style)

### 4.1. The "Liquid Glass" Cards (Panel Utama)
Panel input dan hasil kalkulasi tidak boleh solid.
* **Backdrop:** `backdrop-filter: blur(20px)`.
* **Fill:** `rgba(5, 5, 5, 0.6)` (Semi-transparent dark).
* **Texture:** Overlay gambar *noise/grain* halus (opacity 4%).
* **Border:** Gunakan teknik *Inner Border Gradient*. Bagian atas border lebih terang (putih/oranye pudar) seolah terkena cahaya dari atas.
* **Shadow:** *Glow Shadow*. `box-shadow: 0 0 40px -10px rgba(255, 77, 0, 0.15)`.

### 4.2. Interactive Buttons (Magnetic & Liquid)
* **Primary CTA ("Hitung Potensi"):**
    * *Style:* Gradient Orange-Red.
    * *Interaction:* **Magnetic Effect**. Tombol bergerak sedikit mengikuti posisi kursor saat di-hover (referensi: *Magnet Button* di reactbits).
* **Secondary Actions:**
    * *Style:* Ghost button dengan border tipis dan text putih.

### 4.3. Cursor & Hover Effects
* **Spotlight Effect:** Kursor user memancarkan *glow* oranye redup (radius ~300px) yang menerangi border elemen glass yang dilewatinya. Ini menciptakan efek "senter" di ruang gelap.

---

## 5. Map Interface Styling (Custom Skin)

Peta adalah kanvas utama aplikasi. Tampilan default (Google Maps/OSM) dilarang.

* **Platform:** Mapbox GL JS atau Google Maps dengan Custom Styles (Snazzy Maps).
* **Color Scheme:** Dark Mode Minimalist.
    * *Land:* `#0f0f0f` (Dark Grey).
    * *Water:* `#050505` (Void Black).
    * *Roads:* `#222222` (Subtle visibility).
    * *Labels:* `#888888` (Muted).
* **Drawing Tool (Polygon):**
    * *Fill:* `rgba(255, 77, 0, 0.2)` (Transparan Oranye).
    * *Stroke:* `#FF4D00` (Neon Orange, 2px solid).
    * *Vertices:* Titik sudut berupa lingkaran putih kecil dengan efek *pulse*.

---

## 6. Layout Structure (Floating HUD)

Layout menggunakan prinsip **"Head-Up Display" (HUD)**. Peta memenuhi layar penuh (*Full Screen*), elemen UI "melayang" di atasnya.

### 6.1. Sidebar Control (Kiri Layar)
* Panel kaca vertikal ramping.
* Berisi: Logo, Search Bar (Geocoding), Drawing Tools (Polygon, Undo, Delete), dan Slider Input (Tilt, Azimuth).

### 6.2. Result Dashboard (Kanan Bawah - Floating)
* Muncul hanya setelah kalkulasi selesai (*Lazy Load*).
* **Visual Hierarchy:**
    1.  **Big Number:** Potensi Energi (kWh) - Font Mono ukuran 48px, Gradient Text.
    2.  **Chart Area:** Grafik batang mini (Sparkline) untuk produksi bulanan. Sumbu X/Y minimalis.
    3.  **Financials:** Estimasi Penghematan (IDR) warna *Profit Green*.

---

## 7. Animations & Micro-interactions

Menggunakan library **Framer Motion** untuk transisi yang halus.

1.  **Loading State (The Eclipse):**
    * Animasi lingkaran hitam yang perlahan dikelilingi cincin cahaya oranye (Gerhana Cincin).
    * Efek *Breathing* (membesar-mengecil perlahan).
2.  **Calculation Trigger (The Scan):**
    * Saat tombol "Hitung" ditekan, sebuah garis cahaya horizontal memindai (scan) area polygon yang digambar user di peta (atas ke bawah).
3.  **Data Reveal (Count Up):**
    * Angka hasil tidak langsung muncul statis.
    * Gunakan efek *Count Up* (angka bergulir cepat dari 0 ke hasil akhir) dalam durasi 1.5 detik.

---

## 8. Technical Handoff (Developer Guidelines)

### 8.1. Tailwind CSS Config Snippet
Gunakan token ini untuk memastikan konsistensi desain dalam kode.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        eclipse: {
          900: '#050505', // Void Black
          800: '#0a0a0a', // Surface Dark
          500: '#FF4D00', // Solar Flare (Primary)
          600: '#D91E18', // Magma Red (Secondary)
        },
        profit: '#00FF94', // Success Green
        glass: {
          surface: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.2)',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'eclipse-gradient': 'radial-gradient(circle at 50% 50%, #FF4D00 0%, #050505 70%)',
        'mesh-dark': 'url("/assets/noise.png"), radial-gradient(...)', // Combine noise + gradient
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255, 77, 0, 0.5)',
        'glow-text': '0 0 10px rgba(255, 77, 0, 0.3)',
      },
      animation: {
        'scan-line': 'scan 2s linear infinite',
      }
    },
  },
}

8.2. Required Assets List
Icons: Phosphor Icons (Thin/Regular weight).

Texture: noise-grain.png (Transparent pixel noise).

Fonts: Space Grotesk, Inter, JetBrains Mono (Hosted locally or via Google Fonts).

Libraries:

framer-motion (React Animation).

leaflet or mapbox-gl (Maps).

chart.js or recharts (Data Viz).