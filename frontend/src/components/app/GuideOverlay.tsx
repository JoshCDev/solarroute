import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Polygon, Calculator, ArrowRight } from '@phosphor-icons/react'
import { GlassCard } from '../ui/GlassCard'
import { LiquidCrystalButton, LiquidCrystalButtonAnimated } from '../ui/LiquidCrystalButton'
import { useLanguageStore } from '../../store/languageStore'

interface GuideOverlayProps {
  isOpen: boolean
  onClose: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

export function GuideOverlay({ isOpen, onClose, currentStep, setCurrentStep }: GuideOverlayProps) {
  const { t, language } = useLanguageStore()

  const steps = [
    {
      icon: MapPin,
      title: language === 'id' ? '1. Pilih Lokasi' : '1. Set Location',
      desc: language === 'id' 
        ? 'Klik tombol "Lokasi Saya" atau cari alamat Anda. Pastikan peta menunjukkan rumah Anda dengan jelas.'
        : 'Click "My Location" or search your address. Make sure the map clearly shows your house.',
      color: 'text-eclipse-500',
      bgColor: 'bg-eclipse-500/20'
    },
    {
      icon: Polygon,
      title: language === 'id' ? '2. Gambar Area Atap' : '2. Draw Roof Area',
      desc: language === 'id'
        ? 'Klik "Gambar Area Atap", lalu klik 3 titik di peta untuk membentuk area atap Anda.'
        : 'Click "Draw Roof Area", then click 3+ points on the map to form your roof area.',
      color: 'text-eclipse-500',
      bgColor: 'bg-eclipse-500/20'
    },
    {
      icon: Calculator,
      title: language === 'id' ? '3. Lihat Hasil' : '3. See Results',
      desc: language === 'id'
        ? 'Masukkan tagihan listrik dan klik "Hitung". Lihat hemat uang & listrik dengan panel surya!'
        : 'Enter your bill and click "Calculate". See your money & electricity savings!',
      color: 'text-profit',
      bgColor: 'bg-profit/20'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-eclipse-900/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl"
          >
            <GlassCard className="p-8">
              {/* Close Button */}
              <LiquidCrystalButton
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
              >
                <X className="w-6 h-6" />
              </LiquidCrystalButton>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-white mb-2">
                  {language === 'id' ? 'Panduan Penggunaan' : 'User Guide'}
                </h2>
                <p className="text-gray-400">
                  {language === 'id' 
                    ? 'Ikuti 3 langkah mudah ini:' 
                    : 'Follow these 3 easy steps:'}
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-8">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === index + 1
                  const isCompleted = currentStep > index + 1

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isActive 
                          ? 'border-eclipse-500 bg-eclipse-500/10' 
                          : isCompleted
                            ? 'border-profit/50 bg-profit/5'
                            : 'border-white/10 bg-white/5'
                      }`}
                      onClick={() => setCurrentStep(index + 1)}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${step.color}`} weight="fill" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {step.title}
                          </h3>
                          {isCompleted && (
                            <span className="text-profit text-sm">✓</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                      {/* Arrow */}
                      {isActive && (
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex items-center"
                        >
                          <ArrowRight className="w-5 h-5 text-eclipse-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Tips */}
              <div className="bg-eclipse-500/5 border border-eclipse-500/20 rounded-xl p-4 mb-6">
                <h4 className="text-eclipse-500 font-semibold mb-2 text-sm">
                  💡 {language === 'id' ? 'Tips Penting' : 'Important Tips'}
                </h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>{t('tip.south')}</li>
                  <li>{t('tip.tilt')}</li>
                  <li>{t('tip.shade')}</li>
                </ul>
              </div>

              {/* Start Button */}
              <LiquidCrystalButtonAnimated onClick={onClose}>
                {language === 'id' ? 'Mulai Sekarang →' : 'Start Now →'}
              </LiquidCrystalButtonAnimated>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
