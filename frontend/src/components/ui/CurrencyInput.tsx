import { useState, useEffect, useCallback } from 'react'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  disabled?: boolean
  className?: string
  prefix?: string
  suffix?: string
}

export function CurrencyInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder,
  disabled,
  className = '',
  prefix = '',
  suffix = ''
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID')
  }

  const parseInput = (str: string): number => {
    const cleanStr = str.replace(/\D/g, '')
    return cleanStr ? parseInt(cleanStr, 10) : 0
  }

  const clampValue = useCallback((val: number): number => {
    let clamped = val
    if (min !== undefined && clamped < min) clamped = min
    if (max !== undefined && clamped > max) clamped = max
    return clamped
  }, [min, max])

  useEffect(() => {
    setDisplayValue(formatNumber(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const parsedValue = parseInput(inputValue)
    setDisplayValue(formatNumber(parsedValue))
    onChange(parsedValue)
  }

  const handleBlur = () => {
    const finalValue = clampValue(value)
    onChange(finalValue)
    setDisplayValue(formatNumber(finalValue))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    
    let newValue = value
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      newValue = clampValue(value + step)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      newValue = clampValue(value - step)
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      newValue = clampValue(value + (step * 10))
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      newValue = clampValue(value - (step * 10))
    } else if (e.key === 'Home') {
      e.preventDefault()
      newValue = min !== undefined ? min : 0
    } else if (e.key === 'End') {
      e.preventDefault()
      newValue = max !== undefined ? max : value
    } else {
      return
    }
    
    onChange(newValue)
    setDisplayValue(formatNumber(newValue))
  }

  const suffixPadding = suffix ? 'pr-20' : 'pr-4'

  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="text-[#FF4D00] font-bold text-sm whitespace-nowrap mr-2 flex-shrink-0">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="numeric"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className={`w-full pl-4 ${suffixPadding} py-3 bg-[#0a0a0a] border border-[#444] rounded-xl text-white font-mono font-bold text-base focus:border-[#FF4D00] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs whitespace-nowrap">
          {suffix}
        </span>
      )}
    </div>
  )
}