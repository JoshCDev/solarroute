# Product Requirements Document (PRD): SolarRoute
**Version:** 1.0 (MVP)  
**Date:** February 9, 2026  
**Status:** Ready for Development  
**Author:** Chief System Architect & Solar Energy Specialist

---

## 1. Executive Summary
**SolarRoute** adalah sistem berbasis web yang dirancang untuk menghitung potensi energi surya atap rumah di Indonesia secara presisi. Menggunakan data geospasial (pemetaan atap) dan data meteorologi dari OpenWeatherMap, sistem ini memberikan estimasi produksi energi (kWh), penghematan biaya (IDR), dan analisis kelayakan investasi (ROI) dengan mempertimbangkan faktor iklim tropis Indonesia.

## 2. Technical Stack & Architecture
* **Frontend:** React.js / Vue.js + **Leaflet.js** (untuk interaksi peta & *polygon drawing*).
* **Backend:** Python (FastAPI/Django) - Dipilih karena ekosistem library sains yang kuat (`pvlib`, `numpy`, `pandas`).
* **Database:** PostgreSQL dengan ekstensi **PostGIS** (Wajib untuk kalkulasi area spasial).
* **Caching:** Redis (Menyimpan respons API cuaca untuk mengurangi latensi dan biaya API).
* **External API:** OpenWeatherMap (Solar Irradiance API & One Call API 3.0).

---

## 3. Scientific Logic & Formulas (The "Solar Engine")
*Bagian ini adalah inti logika bisnis (Business Logic) yang harus diimplementasikan di Backend.*

### 3.1. Rumus Energi Dasar ($E_{day}$)
Perhitungan energi harian dalam kWh:

$$E_{day} = A \times GHI_{adj} \times \eta_{panel} \times PR$$

Dimana:
* $A$: Luas Area Atap ($m^2$) - Didapat dari input polygon user.
* $GHI_{adj}$: *Global Horizontal Irradiance* dari OpenWeatherMap, dikoreksi berdasarkan kemiringan atap (*tilt*) dan orientasi (*azimuth*).
* $\eta_{panel}$: Efisiensi Modul PV. Gunakan default **20%** (0.20) untuk panel Monocrystalline modern.
* $PR$: *Performance Ratio* (Faktor Kerugian Sistem).

### 3.2. Performance Ratio (PR) Dinamis
Di iklim tropis Indonesia, panas mengurangi efisiensi. PR dihitung dinamis, bukan statis:

$$PR = 1 - (L_{temp} + L_{sys})$$

* $L_{sys}$ (**System Loss**): **14%** (0.14). Meliputi kerugian kabel, debu, dan efisiensi inverter.
* $L_{temp}$ (**Temperature Loss**): Kerugian akibat panas panel.
    $$L_{temp} = \gamma \times (T_{cell} - 25)$$
    * $\gamma$: Koefisien suhu panel (Standar: -0.4% atau 0.004 per °C).
    * $T_{cell}$: Suhu sel panel, diestimasi dengan rumus: $T_{cell} = T_{air} + (0.025 \times GHI)$.
    * $T_{air}$: Suhu udara real-time dari OpenWeatherMap.

---

## 4. Functional Requirements

### 4.1. Modul Pemetaan (Frontend)
* **FR-01 (Geocoding):** User dapat mencari lokasi rumah berdasarkan alamat.
* **FR-02 (Roof Drawing):** User dapat menggambar polygon di atas citra satelit atap rumah.
* **FR-03 (Area Calculation):** Sistem otomatis menghitung luas area ($m^2$) dari polygon (menggunakan *Geodesic Area*).
* **FR-04 (Configuration):** User dapat mengatur kemiringan atap (default 20°) dan arah hadap (*azimuth*).

### 4.2. Modul Kalkulasi (Backend)
* **FR-05 (Spatial Query):** Backend menerima koordinat centroid dari polygon.
* **FR-06 (Smart Caching):** Cek Redis sebelum memanggil OpenWeatherMap. Jika data iradiasi untuk grid lokasi tersebut tersedia (< 24 jam), gunakan cache.
* **FR-07 (Solar Physics):** Menghitung potensi energi harian, bulanan, dan tahunan menggunakan rumus Fisika di Poin 3.

### 4.3. Modul Finansial (Business Logic)
* **FR-08 (User Input):** User memasukkan rata-rata tagihan listrik bulanan (IDR).
* **FR-09 (Conversion):** Konversi tagihan ke kWh konsumsi (Asumsi Tarif PLN R1: ~Rp 1.444,70/kWh).
* **FR-10 (ROI Analysis):** Estimasi *Break Even Point* (BEP) dalam tahun.
    * Asumsi Biaya Investasi: Rp 15.000.000 per kWp (Pasar Indonesia 2026).

---

## 5. Entity Relationship Diagram (ERD)

Desain database difokuskan pada skalabilitas data spasial.

```mermaid
erDiagram
    USERS {
        UUID id PK
        string email
        string password_hash
        string full_name
        timestamp created_at
    }

    SITES {
        UUID id PK
        UUID user_id FK
        string name "Rumah Bandung"
        geography location "POINT(lat, long)"
        geography roof_polygon "POLYGON((...))"
        float area_sqm "Luas atap"
        float tilt_angle "Default 20"
        float azimuth_angle "0=North, 180=South"
        timestamp created_at
    }

    SOLAR_DATA_CACHE {
        int id PK
        geography location_grid "Grid 1x1km"
        jsonb raw_weather_data "Simpan raw response OWM"
        float ghi_daily_avg
        float temp_daily_avg
        timestamp cached_at
        timestamp expires_at
    }

    SIMULATION_RESULTS {
        UUID id PK
        UUID site_id FK
        float installed_capacity_kwp
        float annual_production_kwh
        float system_cost_idr
        float annual_savings_idr
        float roi_years
        float co2_reduced_ton
        timestamp calculated_at
    }

    TARIFFS {
        int id PK
        string provider "PLN"
        string category "R1-900VA, R1-1300VA"
        float price_per_kwh
        boolean is_subsidized
        date effective_date
    }

    USERS ||--o{ SITES : owns
    SITES ||--o{ SIMULATION_RESULTS : generates
    SITES }|--|| SOLAR_DATA_CACHE : references_nearest
	
Keterangan ERD:
1. SITES: Menggunakan tipe data GEOGRAPHY (PostGIS) untuk menyimpan koordinat dan bentuk atap secara akurat.
2. SOLAR_DATA_CACHE: Tabel ini memisahkan data cuaca dari data user. Cache disimpan berdasarkan grid lokasi, bukan per user, untuk efisiensi penyimpanan dan panggilan API.
3. TARIFFS: Tabel dinamis untuk menyimpan tarif dasar listrik yang dapat berubah sewaktu-waktu.

6. API Endpoint Specification (Core Calculation)
POST /api/v1/simulation/calculate
Description: Endpoint utama untuk menerima data fisik atap dan mengembalikan hasil simulasi energi serta finansial.
Request Body:
JSON
{
  "site_name": "Rumah Dago",
  "polygon_coordinates": [
    [-6.9175, 107.6191],
    [-6.9176, 107.6192],
    [-6.9178, 107.6190],
    [-6.9175, 107.6191]
  ],
  "monthly_bill_idr": 1500000,
  "roof_tilt": 20,
  "roof_azimuth": 180
}

Response Body:
JSON
{
  "status": "success",
  "data": {
    "site_details": {
        "roof_area_sqm": 45.5,
        "location": "Bandung, ID"
    },
    "energy_output": {
        "recommended_system_size_kwp": 3.2,
        "daily_production_kwh": 12.6,
        "annual_production_kwh": 4600.50
    },
    "financials": {
      "estimated_system_cost_idr": 48000000,
      "annual_savings_idr": 6645000,
      "break_even_point_years": 7.2
    },
    "environment": {
      "co2_offset_ton": 3.8
    },
    "meta": {
        "weather_source": "OpenWeatherMap (Cached)",
        "calculation_timestamp": "2026-02-09T20:30:00Z"
    }
  }
}

7. Developer Implementation Notes
1. Coordinate System: Pastikan Frontend mengirim koordinat dalam format [Lat, Lng]. Backend (PostGIS) harus menyimpannya dalam SRID 4326 (WGS 84).
2. Polygon Validation: Validasi input polygon sangat krusial:
- Polygon harus tertutup (titik awal = titik akhir).
- Polygon tidak boleh self-intersecting.
- Minimal 3 titik koordinat.