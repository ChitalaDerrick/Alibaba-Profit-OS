'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { SubscriptionPricing } from '@/components/subscription-pricing'
import { useAuth } from '@/lib/auth-hooks'
import { Zap } from 'lucide-react'

export default function SubscriptionPlansPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly' | 'annual' | undefined>()

  // Redirect unauthenticated users
  if (!isLoading && !user) {
    router.push('/auth/sign-up')
    return null
  }

  const handleSelectPlan = async (planType: 'daily' | 'monthly' | 'annual') => {
    try {
      setLoading(true)
      setSelectedPlan(planType)

      // Call API to initiate Paystack payment
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planType,
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const data = await response.json()
      
      // Redirect to Paystack payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        console.error('[v0] No payment URL returned')
      }
    } catch (error) {
      console.error('[v0] Error selecting plan:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4 text-sm font-semibold">
            <Zap className="w-4 h-4" />
            Welcome, {user?.email?.split('@')[0]}!
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Unlock unlimited calculations, save projects, and get unlimited access to all features. Select the plan that works best for you.
          </p>
        </div>

        {/* Pricing Component */}
        <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-12 mb-12">
          <SubscriptionPricing 
            onSelect={handleSelectPlan}
            loading={loading}
            selectedPlan={selectedPlan}
          />
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I switch plans?</h3>
              <p className="text-slate-600 text-sm">
                Yes! You can upgrade or downgrade your plan anytime. We'll adjust your billing accordingly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h3>
              <p className="text-slate-600 text-sm">
                You already tried our calculator with 10 free calculations. Now upgrade to unlock unlimited access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What if I'm not satisfied?</h3>
              <p className="text-slate-600 text-sm">
                Recurring plans auto-renew, but you can cancel anytime with no questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h3>
              <p className="text-slate-600 text-sm">
                Contact our support team within 7 days of purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
