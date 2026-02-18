import { motion } from 'framer-motion'
import { Sun, MapPin, Calculator, ArrowRight, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { LiquidCrystalButton, LiquidCrystalButtonAnimated } from '../ui/LiquidCrystalButton'
import { SolarSystemBackground } from './SolarSystemBackground'
import { useLanguageStore } from '../../store/languageStore'

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { language, setLanguage, t } = useLanguageStore()

  const features = [
    'Gratis & Tanpa Registrasi',
    'Data Cuaca Real-time',
    'Hitungan Sesuai Iklim Indonesia',
    'Estimasi Biaya Akurat'
  ]

  const featuresEn = [
    'Free & No Registration',
    'Real-time Weather Data',
    'Indonesian Climate Calculations',
    'Accurate Cost Estimates'
  ]

  const displayFeatures = language === 'id' ? features : featuresEn

  return (
    <div className="fixed inset-0 overflow-hidden bg-eclipse-900">
      {/* Solar System Background */}
      <SolarSystemBackground />

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-eclipse-900 via-eclipse-900/80 to-transparent z-10" />

      {/* Language Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 right-6 z-50 flex gap-2"
      >
        <LiquidCrystalButton
          onClick={() => setLanguage('id')}
          variant={language === 'id' ? 'primary' : 'ghost'}
          size="sm"
        >
          ID
        </LiquidCrystalButton>
        <LiquidCrystalButton
          onClick={() => setLanguage('en')}
          variant={language === 'en' ? 'primary' : 'ghost'}
          size="sm"
        >
          EN
        </LiquidCrystalButton>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left - Hero Content */}
          <div className="space-y-8 max-w-2xl">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-eclipse-500 to-eclipse-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,77,0,0.4)]">
                  <Sun weight="fill" className="w-8 h-8 text-white" />
                </div>
                {/* Orbiting dot */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute -top-1 left-1/2 w-2 h-2 bg-eclipse-500 rounded-full shadow-[0_0_10px_#FF4D00]" />
                </motion.div>
              </div>
              <div>
                <span className="text-3xl font-display font-bold text-white tracking-tight">SolarRoute</span>
                <div className="flex items-center gap-2 text-xs text-eclipse-500">
                  <Sparkle weight="fill" className="w-3 h-3" />
                  <span>{language === 'id' ? 'Kalkulator Solar Presisi' : 'Precision Solar Calculator'}</span>
                </div>
              </div>
            </motion.div>

            {/* Headline with eclipse gradient text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight">
                <span className="text-white">{language === 'id' ? 'Hitung Potensi' : 'Calculate Your'}</span>
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #FF4D00 0%, #FF8800 50%, #D91E18 100%)',
                  }}
                >
                  {language === 'id' ? 'Solar Rumah Anda' : 'Home Solar Potential'}
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </motion.div>

            {/* Features with glass cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              {displayFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-eclipse-500/30 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 text-eclipse-500 flex-shrink-0" weight="fill" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button with animated border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-4"
            >
              <LiquidCrystalButtonAnimated onClick={onStart}>
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5" weight="bold" />
              </LiquidCrystalButtonAnimated>
            </motion.div>

            {/* Trust Badge with glass effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-eclipse-500/50 to-eclipse-600/50 border-2 border-eclipse-900 flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-medium">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                {t('hero.trusted')}
              </p>
            </motion.div>
          </div>

          {/* Right - How It Works Cards */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Decorative eclipse ring */}
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-eclipse-500/20 animate-pulse" />
              <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full border border-eclipse-500/10" />

              {/* Steps */}
              <div className="space-y-4 relative">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-eclipse-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-eclipse-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-eclipse-500/30 transition-colors">
                      <MapPin className="w-6 h-6 text-eclipse-500" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-1">{t('how.step1.title')}</h3>
                      <p className="text-gray-400 text-sm">{t('how.step1.desc')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Connector */}
                <div className="ml-10 w-0.5 h-6 bg-gradient-to-b from-eclipse-500/50 to-transparent" />

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-eclipse-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-eclipse-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-eclipse-500/30 transition-colors">
                      <svg className="w-6 h-6 text-eclipse-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-1">{t('how.step2.title')}</h3>
                      <p className="text-gray-400 text-sm">{t('how.step2.desc')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Connector */}
                <div className="ml-10 w-0.5 h-6 bg-gradient-to-b from-eclipse-500/50 to-transparent" />

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-profit/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-profit/20 flex items-center justify-center flex-shrink-0 group-hover:bg-profit/30 transition-colors">
                      <Calculator className="w-6 h-6 text-profit" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg mb-1">{t('how.step3.title')}</h3>
                      <p className="text-gray-400 text-sm">{t('how.step3.desc')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Stats Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-eclipse-500/10 to-transparent border border-eclipse-500/20"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-mono font-bold text-eclipse-500">15jt</p>
                    <p className="text-xs text-gray-500 mt-1">Rp/kWp</p>
                  </div>
                  <div>
                    <p className="text-3xl font-mono font-bold text-profit">5-7</p>
                    <p className="text-xs text-gray-500 mt-1">Thn ROI</p>
                  </div>
                  <div>
                    <p className="text-3xl font-mono font-bold text-white">20%</p>
                    <p className="text-xs text-gray-500 mt-1">Efisiensi</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <p className="text-gray-600 text-sm text-center">
          OpenWeatherMap • pvlib • Khusus Iklim Indonesia
        </p>
      </motion.div>

      {/* Global shimmer animation style */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
