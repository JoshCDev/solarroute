# SolarRoute - Quick Start Guide

## 🚨 Important: Setup Google Maps API Key

The app now uses **Google Maps API** for up-to-date satellite imagery.

### Step 1: Get Google Maps API Key

1. Go to https://console.cloud.google.com/
2. Create a new project or use existing
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
4. Create API Key in Credentials
5. Copy the key

### Step 2: Add to .env

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

---

## 🔧 Change Backend Port (If 8000 is taken)

**Backend** (`backend/.env`):
```env
PORT=8080  # Change to available port
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080  # Match backend port
```

---

## 🚀 How to Run

### Terminal 1 - Backend:
```bash
cd c:\xampp\htdocs\solarroute\backend
.venv\Scripts\python main.py
```

### Terminal 2 - Frontend:
```bash
cd c:\xampp\htdocs\solarroute\frontend
npm run dev
```

Open: **http://localhost:5173**

---

## ✨ Recent Fixes

### 1. **Google Maps Multiple Loading** ✅
- Created singleton loader pattern
- Prevents duplicate script injection
- Fixed console errors

### 2. **Map Reset Fixed** ✅
- Map no longer resets when clicking "Tambah Area"
- Zoom level preserved during drawing
- View stays centered on user location

### 3. **UI Visibility Improved** ✅
- Dark opaque backgrounds (#0f0f0f)
- High contrast text (white on dark)
- Orange accents (#FF4D00) for highlights
- Green (#00FF94) for success states
- Clear borders and shadows

### 4. **Calculation Button Fixed** ✅
- Added console logging for debugging
- Better error handling
- Proper response validation
- Toast notifications for feedback

### 5. **Center Crosshair** ✅
- Shows when in drawing mode
- "KLIK UNTUK TAMBAH TITIK" label
- Helps with pinpoint accuracy

---

## 🎯 How to Use

### 1. Find Your House
- Type address in search bar, OR
- Click target icon for GPS location

### 2. Draw Roof Area
1. Click **"Gambar Area Atap"**
2. Crosshair appears in center
3. Click center of screen to add points
4. Move map (drag) between clicks
5. Add at least 3 points
6. Click **"Selesai"**

### 3. Configure Settings
- **Tilt**: Match your roof angle
- **Direction**: South (180°) is ideal
- Use **Preset buttons** for quick setup

### 4. Enter Bill
- Monthly electricity bill in Rupiah
- Example: 1500000

### 5. Calculate
- Click **"HITUNG POTENSI"**
- Wait for analysis
- View results!

---

## 🎨 UI Components

| Component | Style |
|-----------|-------|
| **Background** | #0a0a0a (near black) |
| **Cards** | #0f0f0f with border #333 |
| **Primary** | #FF4D00 (orange) |
| **Success** | #00FF94 (green) |
| **Text** | White / Gray-300 |
| **Accents** | High contrast, bold |

---

## 🔧 Troubleshooting

### "Google Maps loaded multiple times"
✅ Fixed with singleton loader pattern

### "Map resets when drawing"
✅ Fixed - zoom now preserved

### "Calculate button not working"
- Check browser console (F12)
- Ensure backend is running
- Check polygon has 3+ points
- Check bill amount > 0

### "UI text barely visible"
✅ Fixed with opaque backgrounds and high contrast

---

## 📊 Expected Console Output

When clicking Calculate:
```
=== CALCULATE CLICKED === {canCalculate: true, polygonLength: 4, monthlyBill: 1500000}
Sending API request: {polygon: [[...]], bill_idr: 1500000, tilt: 20, azimuth: 180}
API Response: {site_details: {...}, energy_output: {...}, ...}
```

---

## 🎉 Features

- ✅ Modern liquid glass UI
- ✅ Google Maps satellite (up-to-date)
- ✅ Center crosshair for accuracy
- ✅ Preserved zoom during drawing
- ✅ Toast notifications
- ✅ Flexible port configuration
- ✅ Step-by-step guide
- ✅ Real-time weather data

---

Enjoy SolarRoute! ☀️🚀
