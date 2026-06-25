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
    return <div className="w-20 h-6 bg-slate-200 rounded-full animate-pulse" />
  }

  if (!subscription) return null

  // Super user status
  if (subscription.type === 'super_user') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all"
      >
        <Crown className="w-4 h-4 text-purple-600" />
        <div className="text-xs font-bold text-purple-900">
          Super User
        </div>
      </button>
    )
  }

  if (subscription.isActive && subscription.type !== 'free') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      >
        <Crown className="w-4 h-4 text-blue-600" />
        <div className="text-xs font-bold text-blue-900">
          {subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)}
        </div>
        <div className="text-xs text-blue-700 font-semibold">
          {subscription.daysRemaining}d
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all cursor-pointer"
    >
      <Zap className="w-4 h-4 text-slate-500" />
      <div className="text-xs font-bold text-slate-600">
        Free Tier
      </div>
    </button>
  )
}
