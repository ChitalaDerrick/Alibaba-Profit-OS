'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader, AlertCircle, CheckCircle } from 'lucide-react'

const PLANS = {
  daily: { name: 'Daily', price: 50, period: '24 hours' },
  monthly: { name: 'Monthly', price: 1200, period: 'month' },
  yearly: { name: 'Yearly', price: 10000, period: 'year' },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planParam = searchParams.get('plan') as keyof typeof PLANS
  const [plan, setPlan] = useState<typeof PLANS[keyof typeof PLANS] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!planParam || !PLANS[planParam]) {
      setError('Invalid plan selected')
      return
    }
    setPlan(PLANS[planParam])
  }, [planParam])

  const handlePayment = async () => {
    if (!plan) return

    setLoading(true)
    setError('')

    try {
      // Initialize Paystack payment
      const response = await fetch('/api/subscriptions/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planParam,
          amount: plan.price * 100, // Convert to kobo
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[v0] Payment API error:', data)
        const errorMsg = data.error || 'Failed to initialize payment'
        throw new Error(errorMsg)
      }

      // Redirect to Paystack payment URL
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('No payment URL received from server')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed'
      console.error('[v0] Payment error:', errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }

  if (error && error === 'Invalid plan selected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Plan</h1>
            <p className="text-slate-600 mb-6">The plan you selected is not available.</p>
            <Button onClick={() => router.back()} className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <Loader className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Confirm Your Plan</h1>
          <p className="text-slate-600 mb-8">Complete your payment to activate your subscription</p>

          {/* Plan Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Selected Plan</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{plan.name} Plan</h2>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-blue-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Plan Duration:</span>
                <span className="font-semibold text-slate-900">{plan.period}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-600">Price:</span>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{plan.price}</p>
                  <p className="text-xs text-slate-500">KES</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-8 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-600">Includes:</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Unlimited Calculations
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Save & Export Reports
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Ad-Free Experience
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-center text-slate-500 mt-6">
            Powered by <span className="font-semibold">Paystack</span> • Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          </div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
