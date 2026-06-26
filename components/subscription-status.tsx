'use client'

import { useEffect, useState } from 'react'
import { Zap, Crown } from 'lucide-react'

interface SubscriptionStatusData {
  isActive: boolean
  type: string
  daysRemaining: number
  endDate?: string
}

interface SubscriptionStatusProps {
  onClick?: () => void
}

export function SubscriptionStatus({ onClick }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionStatus()
    const interval = setInterval(fetchSubscriptionStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscriptions/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="w-16 sm:w-20 h-5 sm:h-6 bg-slate-200 rounded-full animate-pulse" />
  }

  if (!subscription) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all cursor-pointer"
      >
        <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-slate-500" />
        <div className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">
          Free Tier
        </div>
      </button>
    )
  }

  // Super user status
  if (subscription.type === 'super_user') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
      >
        <Crown className="w-3 sm:w-4 h-3 sm:h-4 text-purple-600" />
        <div className="text-[10px] sm:text-xs font-bold text-purple-900 whitespace-nowrap">
          Super User
        </div>
      </button>
    )
  }

  if (subscription.isActive && subscription.type !== 'free') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      >
        <Crown className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
        <div className="text-[10px] sm:text-xs font-bold text-blue-900 whitespace-nowrap">
          {subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)}
        </div>
        <div className="text-[10px] sm:text-xs text-blue-700 font-semibold whitespace-nowrap">
          {subscription.daysRemaining}d
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all cursor-pointer"
    >
      <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-slate-500" />
      <div className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap">
        Free Tier
      </div>
    </button>
  )
}
