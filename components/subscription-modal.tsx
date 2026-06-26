'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { SubscriptionPricing, SUBSCRIPTION_PLANS } from './subscription-pricing'
import { useAuth } from '@/lib/auth-hooks'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function SubscriptionModal({ isOpen, onClose, onSuccess }: SubscriptionModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof SUBSCRIPTION_PLANS | null>(null)

  if (!isOpen) return null

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Upgrade Your Plan</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-slate-600 text-center">
              Sign in to upgrade your subscription and unlock unlimited calculations and product saving.
            </p>
          </div>
          
          <a
            href="/auth/login"
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors block text-center"
          >
            Sign In to Upgrade
          </a>
        </div>
      </div>
    )
  }

  // Prevent body scroll when modal is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  const handleClose = () => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto'
    }
    onClose()
  }

  const handlePlanSelect = async (planType: keyof typeof SUBSCRIPTION_PLANS) => {
    setLoading(true)
    setError(null)

    try {
      // Initialize Paystack payment
      const plan = SUBSCRIPTION_PLANS[planType]
      
      // Create payment reference
      const reference = `sub_${user.id}_${Date.now()}`

      // Initialize Paystack inline
      const handler = (window as any).PaystackPop?.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email || 'customer@example.com',
        amount: plan.price * 100, // Paystack requires amount in kobo
        ref: reference,
        currency: 'KES',
        onClose: function () {
          setLoading(false)
        },
        onSuccess: async function (response: any) {
          // Verify payment on backend
          try {
            const verifyResponse = await fetch('/api/subscriptions/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                planType,
              }),
            })

            if (verifyResponse.ok) {
              const result = await verifyResponse.json()
              if (result.success) {
                // Activate subscription on backend
                const activateResponse = await fetch('/api/subscriptions/purchase', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    planType,
                    paymentReference: response.reference,
                  }),
                })

                if (activateResponse.ok) {
                  onSuccess?.()
                  handleClose()
                } else {
                  setError('Failed to activate subscription')
                }
              } else {
                setError('Payment verification failed')
              }
            } else {
              setError('Failed to verify payment')
            }
          } catch (err) {
            console.error('[v0] Verification error:', err)
            setError('An error occurred. Please contact support.')
          }
          setLoading(false)
        },
      })

      handler?.charge()
    } catch (err) {
      console.error('[v0] Subscription error:', err)
      setError('Failed to process subscription')
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upgrade Your Access</h2>
            <p className="text-sm text-slate-600 mt-1">Choose a subscription plan to unlock all features</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900 font-semibold">{error}</p>
            </div>
          )}

          <SubscriptionPricing 
            onSelect={handlePlanSelect}
            loading={loading}
            selectedPlan={selectedPlan}
          />

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              By selecting a plan, you authorize us to charge your account on a recurring basis for {selectedPlan ? SUBSCRIPTION_PLANS[selectedPlan].period : 'the selected period'}. You can cancel anytime from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
