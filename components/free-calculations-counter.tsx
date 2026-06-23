"use client"

import { useEffect, useState } from "react"
import { getFreeCalculationsRemaining, getFreeCalculationsUsed, FREE_TIER_LIMIT, onFreeCalculationsUpdate } from "@/lib/free-calculations"
import { AlertCircle } from "lucide-react"

interface FreeCalculationsCounterProps {
  isAuthenticated: boolean
}

export function FreeCalculationsCounter({ isAuthenticated }: FreeCalculationsCounterProps) {
  const [remaining, setRemaining] = useState(FREE_TIER_LIMIT)
  const [used, setUsed] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateCounter = () => {
      setRemaining(getFreeCalculationsRemaining())
      setUsed(getFreeCalculationsUsed())
    }
    updateCounter()
    
    // Listen for calculation updates within this tab
    const unsubscribe = onFreeCalculationsUpdate(updateCounter)
    
    // Also listen for storage changes from other tabs
    window.addEventListener('storage', updateCounter)
    
    return () => {
      unsubscribe()
      window.removeEventListener('storage', updateCounter)
    }
  }, [])

  if (!mounted || isAuthenticated) return null

  const percentage = (used / FREE_TIER_LIMIT) * 100
  const isWarning = remaining <= 2
  const isExhausted = remaining === 0

  return (
    <div className={`rounded-2xl border-2 p-4 transition-all ${
      isExhausted 
        ? 'bg-red-50/50 border-red-300'
        : isWarning
        ? 'bg-amber-50/50 border-amber-300'
        : 'bg-blue-50/50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isExhausted && <AlertCircle className="w-4 h-4 text-red-600" />}
          <span className="text-sm font-semibold text-slate-900">
            Free Calculations
          </span>
        </div>
        <span className={`text-sm font-bold ${
          isExhausted
            ? 'text-red-600'
            : isWarning
            ? 'text-amber-600'
            : 'text-blue-600'
        }`}>
          {remaining} / {FREE_TIER_LIMIT}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isExhausted
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Helper text */}
      {isExhausted && (
        <p className="text-xs text-red-600 mt-2 font-medium">
          You&apos;ve used all your free calculations. Create an account to continue!
        </p>
      )}
      {isWarning && !isExhausted && (
        <p className="text-xs text-amber-600 mt-2">
          {remaining} calculation{remaining !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  )
}
