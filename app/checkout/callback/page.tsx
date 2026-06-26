'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@supabase/supabase-js'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!reference) {
      setStatus('error')
      setError('No payment reference provided')
      return
    }

    verifyPayment()
  }, [reference])

  const verifyPayment = async () => {
    try {
      // First check if user is already authenticated
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { user } } = await supabase.auth.getUser()
      
      const response = await fetch('/api/subscriptions/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, userId: user?.id }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed')
      }

      setPaymentData(data)
      setStatus('success')
      setIsAuthenticated(!!user)

      // If user is authenticated, subscription was already activated in verify-payment
      // If not, redirect to create account
      const redirectDelay = 2000
      setTimeout(() => {
        if (user?.id) {
          console.log('[v0] User already authenticated, subscription activated, redirecting to home')
          // Redirect to home with cache bust to ensure subscription status is refreshed
          router.push('/?_refresh=' + Date.now())
        } else {
          console.log('[v0] User not authenticated, redirecting to create account')
          router.push(`/checkout/create-account?reference=${reference}`)
        }
      }, redirectDelay)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Payment verification failed')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h1>
            <p className="text-slate-600">Please wait while we confirm your payment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Payment Failed</h1>
            <p className="text-slate-600 mb-6 text-center">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/')} className="w-full">
                Return Home
              </Button>
              <button
                onClick={verifyPayment}
                className="w-full px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">
            Your payment has been confirmed.{' '}
            {isAuthenticated 
              ? 'Activating your subscription and redirecting...' 
              : 'Redirecting to create your account...'}
          </p>
          <div className="flex justify-center">
            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
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
      <PaymentCallbackContent />
    </Suspense>
  )
}
