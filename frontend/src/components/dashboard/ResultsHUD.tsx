import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightning, TrendUp, Tree, Wallet, X, Sun, ChartBar, Download } from '@phosphor-icons/react'
import { CountUp } from '../ui/CountUp'
import { useSimulationStore } from '../../store/simulationStore'
import { useLanguageStore } from '../../store/languageStore'
import { exportToPDF } from '../../utils/pdfExport'

function MonthlyChart({ monthlyData }: { monthlyData: Array<{ month: string; monthly_energy_kwh: number }> }) {
  const maxValue = Math.max(...monthlyData.map(d => d.monthly_energy_kwh))
  const { t } = useLanguageStore()

  return (
    <div role="table" aria-label={t('results.monthlyChart')} className="space-y-3">
      <div role="rowgroup">
        {monthlyData.map((data, index) => (
          <motion.div
            key={data.month}
            role="row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3"
          >
            <span role="cell" className="w-8 text-xs text-gray-400 font-mono">{data.month}</span>
            <div role="cell" className="flex-1 h-6 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.monthly_energy_kwh / maxValue) * 100}%` }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.5 }}
                className={`h-full rounded-full ${
                  data.monthly_energy_kwh === maxValue
                    ? 'bg-gradient-to-r from-[#FF4D00] to-[#D91E18]'
                    : 'bg-[#333]'
                }`}
                aria-label={`${data.month}: ${(data.monthly_energy_kwh / 1000).toFixed(1)} MWh`}
              />
            </div>
            <span role="cell" className="w-16 text-right text-xs text-gray-300 font-mono">
              {(data.monthly_energy_kwh / 1000).toFixed(1)} MWh
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function ResultsHUD() {
  const { results, setResults, polygon, showToast } = useSimulationStore()
  const { language, t } = useLanguageStore()
  const [isExporting, setIsExporting] = useState(false)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  
  if (!results) return null

  const handleExportPDF = async () => {
    if (!results || !resultsRef) return
    
    setIsExporting(true)
    try {
      await exportToPDF(results, polygon, resultsRef)
      showToast(t('results.pdfSuccess'), 'success')
    } catch (error) {
      console.error('Export failed:', error)
      showToast(language === 'id' ? 'Gagal mengunduh PDF' : 'Failed to download PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const {
    site_details,
    energy_output,
    financials,
    environment,
    meta
  } = results

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} M`
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} JT`
    }
    return value.toLocaleString('id-ID')
  }

return (
    <div ref={resultsRef} className="fixed left-2 right-2 bottom-2 sm:right-4 sm:bottom-4 sm:left-auto sm:w-[360px] lg:w-[400px] z-50 max-h-[90vh] overflow-y-auto">
      {/* Liquid Glass Card */}
      <div className="bg-[#0f0f0f]/95 backdrop-blur-2xl border border-[#333] rounded-3xl shadow-2xl overflow-hidden">
{/* Header */}
        <div className="relative p-6 border-b border-[#333] bg-gradient-to-r from-[#FF4D00]/10 to-transparent">
          <button
            onClick={() => setResults(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={language === 'id' ? 'Tutup hasil' : 'Close results'}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="absolute top-4 right-14 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#00FF94] hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={language === 'id' ? 'Unduh PDF' : 'Download PDF'}
            aria-label={language === 'id' ? 'Unduh laporan PDF' : 'Download PDF report'}
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-[#00FF94] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-5 h-5" weight="bold" aria-hidden="true" />
            )}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#D91E18] flex items-center justify-center shadow-lg">
              <Sun weight="fill" className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('results.title')}</h2>
              <p className="text-xs text-gray-400">
                {new Date(meta.calculation_timestamp).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

<div className="p-6 space-y-6">
          {/* Daily Production */}
          <div className="text-center py-6 border-b border-[#333]">
            <p className="text-gray-400 mb-2">{t('results.dailyEnergy')}</p>
            <div className="text-5xl font-mono font-bold text-[#FF4D00]">
              <CountUp 
                end={energy_output.daily_production_kwh} 
                decimals={1}
                suffix=" kWh"
              />
            </div>
<p className="text-[#00FF94] mt-2 font-medium">
              <CountUp
                end={energy_output.annual_production_kwh / 1000}
                decimals={1}
                suffix=" MWh/"
              />
              {t('results.year')}
            </p>
          </div>

{/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Lightning className="w-5 h-5 text-[#FF4D00]" weight="fill" aria-hidden="true" />
                <span className="text-sm">{t('results.systemSize')}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-white">
                {energy_output.recommended_system_size_kwp.toFixed(1)} kWp
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <TrendUp className="w-5 h-5 text-[#FF4D00]" aria-hidden="true" />
                <span className="text-sm">{t('results.roofArea')}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-white">
                {site_details.roof_area_sqm.toFixed(1)} m²
              </p>
            </div>

            <div className="bg-[#00FF94]/10 rounded-xl p-4 border border-[#00FF94]/30">
              <div className="flex items-center gap-2 text-[#00FF94] mb-2">
                <Wallet className="w-5 h-5" weight="fill" aria-hidden="true" />
                <span className="text-sm">{t('results.yearlySavings')}</span>
              </div>
              <p className="text-xl font-mono font-bold text-[#00FF94]">
                Rp {formatCurrency(financials.annual_savings_idr)}
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <TrendUp className="w-5 h-5 text-[#FF4D00]" weight="fill" aria-hidden="true" />
                <span className="text-sm">{t('results.payback')}</span>
              </div>
              <p className="text-2xl font-mono font-bold text-white">
                {financials.break_even_point_years.toFixed(1)} {t('results.years')}
              </p>
            </div>
          </div>

          {/* System Cost */}
          <div className="bg-[#FF4D00]/10 rounded-xl p-5 border border-[#FF4D00]/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{t('results.systemCost')}</span>
              <span className="text-2xl font-mono font-bold text-[#FF4D00]">
                Rp {formatCurrency(financials.estimated_system_cost_idr)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('results.systemCostDesc')}
            </p>
          </div>

          {/* CO2 Impact */}
          <div className="bg-[#00FF94]/10 rounded-xl p-5 border border-[#00FF94]/30 flex items-center gap-4">
            <Tree className="w-10 h-10 text-[#00FF94]" weight="fill" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-[#00FF94]">
                {environment.co2_offset_ton.toFixed(1)} ton CO₂
              </p>
              <p className="text-sm text-[#00FF94]/70">
                {language === 'id' ? 'Setara' : 'Equivalent to'} {(environment.co2_offset_ton * 45).toFixed(0)} {t('results.trees')}
              </p>
            </div>
          </div>

{/* Monthly Production Chart */}
          {energy_output.monthly_breakdown?.monthly_breakdown && (
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
              <div className="flex items-center gap-2 mb-4">
                <ChartBar className="w-5 h-5 text-[#FF4D00]" aria-hidden="true" />
                <span className="text-sm font-semibold text-white">{t('results.monthlyChart')}</span>
              </div>
              <MonthlyChart monthlyData={energy_output.monthly_breakdown.monthly_breakdown} />
              <div className="mt-4 pt-3 border-t border-[#333] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">{t('results.peak')}</span>
                  <span className="ml-1 text-[#FF4D00] font-mono">{energy_output.monthly_breakdown.peak_month}</span>
                </div>
                <div>
                  <span className="text-gray-400">{t('results.lowest')}</span>
                  <span className="ml-1 text-gray-300 font-mono">{energy_output.monthly_breakdown.lowest_month}</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Losses */}
          {site_details.detailed_losses && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">{t('results.losses')}</span>
                  <span className="text-xs font-mono text-[#00FF94]">
                    PR: {(site_details.detailed_losses.performance_ratio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: t('results.temperature'), value: site_details.detailed_losses.temperature_loss_percent, color: 'text-red-400' },
                    { label: t('results.soiling'), value: site_details.detailed_losses.soiling_loss_percent, color: 'text-yellow-400' },
                    { label: t('results.wiring'), value: site_details.detailed_losses.wiring_loss_percent, color: 'text-gray-400' },
                    { label: t('results.inverter'), value: site_details.detailed_losses.inverter_loss_percent, color: 'text-gray-400' },
                    { label: t('results.orientation'), value: site_details.detailed_losses.orientation_loss_percent, color: 'text-orange-400' },
                  ].map((loss, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-400">{loss.label}</span>
                      <span className={`font-mono ${loss.color}`}>{loss.value.toFixed(1)}%</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#333] flex justify-between text-xs">
                  <span className="text-gray-400">{t('results.totalDcLoss')}</span>
                  <span className="text-white font-mono">{site_details.detailed_losses.total_dc_losses_percent.toFixed(1)}%</span>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Panel Layout */}
          {site_details.panel_layout && (
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#333]">
              <div className="flex items-center gap-2 mb-3">
                <Lightning className="w-5 h-5 text-[#FF4D00]" aria-hidden="true" />
                <span className="text-sm font-semibold text-white">{t('results.panelLayout')}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-[#FF4D00]">
                    {site_details.panel_layout.total_panels}
                  </p>
                  <p className="text-xs text-gray-400">{t('results.totalPanels')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-white">
                    {site_details.panel_layout.rows}
                  </p>
                  <p className="text-xs text-gray-400">{t('results.rows')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-mono font-bold text-white">
                    {site_details.panel_layout.columns}
                  </p>
                  <p className="text-xs text-gray-400">{t('results.columns')}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('results.coverage')}</span>
                  <span className="text-white font-mono">{site_details.panel_layout.coverage_percentage.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('results.dimensions')}</span>
                  <span className="text-white font-mono">
                    {site_details.panel_layout.layout_width_m.toFixed(1)}×{site_details.panel_layout.layout_height_m.toFixed(1)}m
                  </span>
                </div>
              </div>
            </div>
          )}

{/* Footer */}
          <div className="pt-2 border-t border-[#333]">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isExporting
                  ? 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00FF94] to-[#00cc77] text-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>{t('results.downloading')}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" weight="bold" aria-hidden="true" />
                  <span>{t('results.downloadPdf')}</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-600 mt-3">
              {t('results.dataSource')} {meta.weather_source} • Real-time calculation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
