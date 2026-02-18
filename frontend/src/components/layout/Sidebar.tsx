import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Compass, Wallet, Calculator, X } from '@phosphor-icons/react'
import { useSimulationStore } from '../../store/simulationStore'
import { useLanguageStore } from '../../store/languageStore'
import { simulationApi } from '../../services/api'
import { InfoTooltip } from '../ui/InfoTooltip'
import { CurrencyInput } from '../ui/CurrencyInput'

export function Sidebar() {
  const {
    polygon,
    area,
    tilt,
    azimuth,
    monthlyBill,
    panelEfficiency,
    systemCostPerKwp,
    electricityTariff,
    setTilt,
    setAzimuth,
    setMonthlyBill,
    setPanelEfficiency,
    setSystemCostPerKwp,
    setElectricityTariff,
    setIsCalculating,
    setResults,
    showToast,
    canCalculate
  } = useSimulationStore()

  const { language, t, tArray } = useLanguageStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isExpanded])

  const handleCalculate = async () => {
    if (!canCalculate) {
      if (polygon.length < 3) {
        showToast(t('error.drawRoof'), 'error')
      } else if (monthlyBill <= 0) {
        showToast(t('error.enterBill'), 'error')
      }
      return
    }

    setIsCalculating(true)

    try {
      const requestData = {
        polygon: polygon.map(p => [p.lat, p.lng] as [number, number]),
        bill_idr: monthlyBill,
        tilt: tilt,
        azimuth: azimuth,
        panel_efficiency: panelEfficiency,
        system_cost_per_kwp: systemCostPerKwp,
        electricity_tariff: electricityTariff,
      }

      const response = await simulationApi.calculate(requestData)

      if (!response || !response.energy_output) {
        throw new Error('Invalid response from server')
      }

      setResults(response)
      showToast(t('error.calculationComplete'), 'success')
    } catch (err: any) {
      console.error('Calculation error:', err)
      const errorMessage = err.response?.data?.detail || err.message || t('error.calculation')
      showToast(errorMessage, 'error')
      setResults(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const hasEnoughPoints = polygon.length >= 3
  const hasBill = monthlyBill > 0

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsExpanded(true)}
            className="fixed left-2 sm:left-4 top-20 z-50 px-4 py-3 bg-gradient-to-r from-[#FF4D00] to-[#D91E18] text-white rounded-xl shadow-lg"
            aria-label={t('sidebar.openPanel')}
          >
            <Sun weight="fill" className="w-6 h-6" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-2 sm:left-4 top-20 bottom-4 sm:bottom-20 w-[calc(100vw-1rem)] sm:w-[340px] lg:w-[380px] max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-80px)] z-40 overflow-hidden"
          >
            <div className="h-full bg-[#0f0f0f]/95 backdrop-blur-2xl border-r border-[#333] shadow-2xl flex flex-col rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#0a0a0a]">
                <h2 className="text-lg font-bold text-white">{t('sidebar.title')}</h2>
                <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white" aria-label={t('sidebar.closePanel')}>
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{t('sidebar.roofArea')}</span>
                    <span className="font-mono text-[#FF4D00] font-bold text-base">
                      {area > 0 ? `${area.toFixed(1)} m²` : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {polygon.length} {t('sidebar.points')} • {area > 0 ? `${area.toFixed(1)} m² geodesik` : t('sidebar.notDrawn')}
                  </p>
                </div>

                <div className={`space-y-3 ${!hasEnoughPoints ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      hasEnoughPoints ? 'bg-[#FF4D00] text-white' : 'bg-[#333] text-gray-500'
                    }`}>2</div>
                    <Compass className="w-4 h-4 text-[#FF4D00]" aria-hidden="true" />
                    <span className="font-semibold text-white text-sm">{t('sidebar.roofSettings')}</span>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">{t('sidebar.tilt')}</span>
                        <InfoTooltip
                          title={t('sidebar.tilt')}
                          description={t('sidebar.tiltHelp')}
                          tips={tArray('sidebar.tiltTips')}
                          language={language}
                        />
                      </div>
                      <span className="font-mono text-[#FF4D00] font-bold text-lg bg-[#FF4D00]/20 px-3 py-1 rounded-lg">{tilt}°</span>
                    </div>
                    <input type="range" min="0" max="60" value={tilt} onChange={(e) => setTilt(Number(e.target.value))} className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#FF4D00]" disabled={!hasEnoughPoints} />
                  </div>

                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">{t('sidebar.azimuth')}</span>
                        <InfoTooltip
                          title={t('sidebar.azimuth')}
                          description={t('sidebar.azimuthHelp')}
                          tips={tArray('sidebar.azimuthTips')}
                          language={language}
                        />
                      </div>
                      <span className="font-mono text-[#FF4D00] font-bold text-lg bg-[#FF4D00]/20 px-3 py-1 rounded-lg">{azimuth}°</span>
                    </div>
                    <input type="range" min="0" max="360" value={azimuth} onChange={(e) => setAzimuth(Number(e.target.value))} className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#FF4D00]" disabled={!hasEnoughPoints} />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>U</span><span>T</span><span className="text-[#FF4D00] font-bold">S</span><span>B</span>
                    </div>
                  </div>
                </div>

                <div className={`space-y-3 ${!hasEnoughPoints ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      hasBill ? 'bg-[#FF4D00] text-white' : 'bg-[#333] text-gray-500'
                    }`}>3</div>
                    <Wallet className="w-4 h-4 text-[#FF4D00]" aria-hidden="true" />
                    <span className="font-semibold text-white text-sm">{t('sidebar.electricity')}</span>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-400 text-sm">{t('sidebar.monthlyBill')}</label>
                      <InfoTooltip
                        title={t('sidebar.electricity')}
                        description={t('sidebar.billHelp')}
                        tips={tArray('sidebar.billTips')}
                        language={language}
                      />
                    </div>
                    <CurrencyInput value={monthlyBill} onChange={setMonthlyBill} min={100000} step={50000} placeholder="1.500.000" disabled={!hasEnoughPoints} />
                  </div>
                </div>

                <div className={`space-y-3 ${!hasEnoughPoints ? 'opacity-40' : ''}`}>
                  <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-[#333] hover:border-[#FF4D00]/50 text-sm">
                    <span className="text-gray-300">{t('sidebar.advanced')}</span>
                    <span className="text-[#FF4D00]">{showAdvanced ? '▼' : '▶'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="space-y-3">
                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-sm">{t('sidebar.panelEfficiency')}</span>
                            <InfoTooltip
                              title={t('sidebar.panelEfficiency')}
                              description={t('sidebar.efficiencyHelp')}
                              tips={tArray('sidebar.efficiencyTips')}
                              language={language}
                            />
                          </div>
                          <span className="font-mono text-[#FF4D00] font-bold text-sm bg-[#FF4D00]/20 px-2 py-1 rounded-lg">{(panelEfficiency * 100).toFixed(0)}%</span>
                        </div>
                        <input type="range" min="15" max="25" step="0.5" value={panelEfficiency * 100} onChange={(e) => setPanelEfficiency(Number(e.target.value) / 100)} className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#FF4D00]" disabled={!hasEnoughPoints} />
                      </div>

                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-gray-400 text-sm">{t('sidebar.systemCost')}</label>
                            <InfoTooltip
                              title={t('sidebar.systemCost')}
                              description={t('sidebar.costHelp')}
                              tips={tArray('sidebar.costTips')}
                              language={language}
                            />
                          </div>
                        </div>
                        <CurrencyInput value={systemCostPerKwp} onChange={setSystemCostPerKwp} min={10000000} max={25000000} step={500000} placeholder="15.000.000" disabled={!hasEnoughPoints} prefix="Rp" suffix="/kWp" className="py-2 text-sm" />
                      </div>

                      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333]">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-gray-400 text-sm">{t('sidebar.electricityTariff')}</label>
                            <InfoTooltip
                              title={t('sidebar.electricityTariff')}
                              description={t('sidebar.tariffHelp')}
                              tips={tArray('sidebar.tariffTips')}
                              language={language}
                            />
                          </div>
                        </div>
                        <CurrencyInput value={electricityTariff} onChange={setElectricityTariff} min={1000} max={5000} step={10} placeholder="1.445" disabled={!hasEnoughPoints} prefix="Rp" suffix="/kWh" className="py-2 text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[#333] bg-[#0a0a0a]">
                <button onClick={handleCalculate} disabled={!canCalculate} className={`w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 ${
                  canCalculate ? 'bg-gradient-to-r from-[#FF4D00] to-[#D91E18] text-white hover:shadow-[0_0_30px_rgba(255,77,0,0.5)]' : 'bg-[#222] text-gray-500 cursor-not-allowed border border-[#333]'
                }`}>
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  {t('sidebar.calculate')}
                </button>

                {!canCalculate && (
                  <p className="mt-2 text-xs text-center text-gray-500">
                    {polygon.length < 3 ? t('sidebar.needArea') : t('sidebar.needBill')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}