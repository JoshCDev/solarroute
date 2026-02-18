import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { SimulationResults } from '../store/simulationStore'
import type { RefObject } from 'react'

export async function exportToPDF(
  _results: SimulationResults, 
  _polygon: Array<{ lat: number; lng: number }>, 
  resultsElement: HTMLElement | RefObject<HTMLDivElement>
): Promise<void> {
  // Handle both RefObject and HTMLElement
  let element: HTMLElement | null = null
  
  if ('current' in resultsElement && typeof resultsElement.current === 'object') {
    element = resultsElement.current
  } else if (resultsElement instanceof HTMLElement) {
    element = resultsElement
  }
  
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error('Results element not found')
  }

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - (margin * 2)

  // Capture the ResultsHUD element exactly as it appears
  const canvas = await html2canvas(element, {
    backgroundColor: '#050505',
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    onclone: (clonedDoc) => {
      // Remove buttons from the cloned document
      const clonedElement = clonedDoc.querySelector('.fixed.right-4.bottom-4')
      if (clonedElement) {
        const buttons = clonedElement.querySelectorAll('button')
        buttons.forEach(btn => btn.remove())
        // Also remove the close button's parent div if needed
        const headerButton = clonedElement.querySelector('.absolute.top-4.right-14 button')
        if (headerButton) headerButton.closest('.absolute')?.remove()
      }
    }
  })

  const imgData = canvas.toDataURL('image/png')

  // Calculate dimensions to fit PDF page
  const imgWidth = contentWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let positionY = margin

  // Add title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.setTextColor(255, 77, 0)
  pdf.text('SolarRoute', pageWidth / 2, positionY, { align: 'center' })
  positionY += 10

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(150)
  pdf.text('Laporan Analisis Potensi Energi Surya', pageWidth / 2, positionY, { align: 'center' })
  positionY += 15

  pdf.setDrawColor(255, 77, 0)
  pdf.setLineWidth(0.5)
  pdf.line(margin, positionY, pageWidth - margin, positionY)
  positionY += 10

  // Add the screenshot of ResultsHUD
  if (imgHeight > pageHeight - positionY - margin - 20) {
    pdf.addPage()
    positionY = margin
  }

  pdf.addImage(imgData, 'PNG', margin, positionY, imgWidth, imgHeight)

  // Add footer
  const footerY = pageHeight - 15
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(100)
  pdf.text(`Dibuat: ${new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}`, margin, footerY)
  pdf.text('Data cuaca: OpenWeatherMap • Perhitungan berdasarkan model fisik pvlib', margin, footerY + 5)

  pdf.save(`SolarRoute-Report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export async function exportMapToPDF(
  mapElement: HTMLElement | null,
  _filename: string = 'solar-map.png'
): Promise<string | null> {
  if (!mapElement) return null

  try {
    const canvas = await html2canvas(mapElement, {
      backgroundColor: '#050505',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error capturing map:', error)
    return null
  }
}