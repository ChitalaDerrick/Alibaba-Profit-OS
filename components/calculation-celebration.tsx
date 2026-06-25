'use client'

import { useEffect, useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { getFreeCalculationsRemaining } from '@/lib/free-calculations'

interface CalculationCelebrationProps {
  show: boolean
  onDismiss: () => void
}

export function CalculationCelebration({ show, onDismiss }: CalculationCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const remaining = getFreeCalculationsRemaining()

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Celebration card */}
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-400 px-6 py-4 sm:px-8 sm:py-6 text-center animate-bounce" style={{ animationDuration: '0.6s' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Check className="w-6 h-6 text-emerald-500" />
          <span className="text-xl sm:text-2xl font-black text-slate-900">Calculation Saved!</span>
        </div>
        
        <p className="text-sm sm:text-base text-slate-600 mb-3">
          Great work exploring different scenarios.
        </p>

        <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-lg px-4 py-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-slate-900">
            {remaining} / 100
          </span>
          <span className="text-xs text-slate-600">free left</span>
        </div>
      </div>

      {/* Confetti particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full pointer-events-none"
          style={{
            left: `${50 + (Math.random() - 0.5) * 100}%`,
            top: `${50 + (Math.random() - 0.5) * 100}%`,
            animation: `confetti-fall 2s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          from {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          to {
            opacity: 0;
            transform: translateY(100px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
