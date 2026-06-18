'use client'

import { useEffect, useState } from 'react'
import { checkSuperUserClient } from './super-user'
import { useAuth } from './auth-hooks'

export interface SubscriptionInfo {
  isActive: boolean
  type: string
  daysRemaining: number
  endDate?: string
  autoRenew?: boolean
  isSuperUser?: boolean
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchSubscription()
    const interval = setInterval(fetchSubscription, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [user])

  const fetchSubscription = async () => {
    try {
      // First check if user is super user
      if (user?.id) {
        const isSuperUser = await checkSuperUserClient(user.id)
        if (isSuperUser) {
          setSubscription({
            isActive: true,
            type: 'super_user',
            daysRemaining: Infinity,
            isSuperUser: true,
          })
          setLoading(false)
          return
        }
      }

      // Otherwise fetch normal subscription
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

  return { subscription, loading, refetch: fetchSubscription }
}
