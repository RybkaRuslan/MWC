import { createContext, useContext, useState, ReactNode } from 'react'
import { CalculationResult } from '@shared/lib/calculations'

/* eslint-disable react-refresh/only-export-components */

interface CalculationContextType {
  calculationResult: CalculationResult | null
  setCalculationResult: (result: CalculationResult | null) => void
  isCalculating: boolean
  setIsCalculating: (isLoading: boolean) => void
}

const CalculationContext = createContext<CalculationContextType | undefined>(
  undefined,
)

export const useCalculation = () => {
  const context = useContext(CalculationContext)
  if (!context) {
    throw new Error('useCalculation must be used within a CalculationProvider')
  }
  return context
}

interface CalculationProviderProps {
  children: ReactNode
}

export const CalculationProvider = ({ children }: CalculationProviderProps) => {
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const value = {
    calculationResult,
    setCalculationResult,
    isCalculating,
    setIsCalculating,
  }

  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  )
}
