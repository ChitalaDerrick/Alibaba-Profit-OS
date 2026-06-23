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

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      
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
          return
        }
      }

      // Otherwise fetch normal subscription
      const response = await fetch('/api/subscriptions/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        // If user is authenticated but API fails, set to free
        if (user?.id) {
          setSubscription({
            isActive: false,
            type: 'free',
            daysRemaining: 0,
          })
        }
      }
    } catch (error) {
      console.error('[v0] Failed to fetch subscription:', error)
      // Set to free tier on error to prevent black screen
      if (user?.id) {
        setSubscription({
          isActive: false,
          type: 'free',
          daysRemaining: 0,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchSubscription()
      const interval = setInterval(fetchSubscription, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user?.id])

  return { subscription, loading, refetch: fetchSubscription }
}
