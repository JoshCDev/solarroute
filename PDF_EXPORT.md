# PDF Export Feature

## Overview
SolarRoute now includes PDF export functionality, allowing users to download a comprehensive report of their solar analysis results.

## Features

### Generated PDF Report Includes:
- **Cover Page** with SolarRoute branding
- **Executive Summary** with key metrics
- **System Details** (size, roof area, layout)
- **Financial Analysis** (cost, savings, payback period)
- **Environmental Impact** (CO₂ reduction, tree equivalents)
- **Detailed Losses Breakdown** (temperature, soiling, wiring, etc.)
- **Panel Layout** (rows, columns, coverage)
- **Monthly Production Chart** with seasonal breakdown
- **Footer** with data source and timestamp

## Usage

### For Users:
1. Complete your solar analysis calculation
2. View results in the ResultsHUD panel
3. Click the **Download PDF** button (green button at bottom)
4. PDF will be automatically downloaded with filename: `SolarRoute-Report-YYYY-MM-DD.pdf`

### For Developers:
```typescript
import { exportToPDF } from '@/utils/pdfExport'
import { useSimulationStore } from '@/store/simulationStore'

const { results, polygon } = useSimulationStore()

// Export PDF
await exportToPDF(results, polygon)
```

## Technical Details

### Dependencies
- `jspdf@2.5.1` - PDF generation library
- `html2canvas@1.4.1` - Canvas rendering (for future map export)

### PDF Specifications
- **Format**: A4 (210mm × 297mm)
- **Margins**: 20mm
- **Colors**: SolarRoute brand colors (Orange #FF4D00, Green #00FF94)
- **Fonts**: Helvetica (standard PDF fonts)
- **Language**: Indonesian (with English support planned)

### File Size
Typical PDF size: 150-300 KB

## Customization

### Modifying PDF Template
Edit `src/utils/pdfExport.ts` to customize:
- Colors and styling
- Layout and sections
- Fonts and typography
- Branding elements

### Adding New Sections
1. Add section logic in `exportToPDF()` function
2. Use `addPageIfNeeded()` to handle page breaks
3. Follow existing patterns for consistency

## Known Limitations

1. **Map Image**: Currently not included in PDF (requires canvas capture)
2. **Charts**: Simplified bar charts (not interactive)
3. **Language**: Currently Indonesian-only for PDF text
4. **Fonts**: Limited to standard PDF fonts (Helvetica, Times, Courier)

## Future Enhancements

- [ ] Add map screenshot to PDF
- [ ] Multi-language PDF support (ID/EN)
- [ ] Custom branding options
- [ ] Email PDF functionality
- [ ] Print-optimized layout

## Troubleshooting

### PDF Download Fails
- Check browser popup permissions
- Ensure sufficient disk space
- Try different browser (Chrome/Firefox recommended)

### PDF Appears Blank
- Check console for errors
- Verify results data is complete
- Try refreshing the page and recalculating

### Layout Issues
- Check browser zoom level (100% recommended)
- Update to latest browser version
- Clear browser cache

## License
Part of SolarRoute project - MIT License