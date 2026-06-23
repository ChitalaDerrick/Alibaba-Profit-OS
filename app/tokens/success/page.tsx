'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Suspense } from 'react'

function TokenSuccessContent() {
  const searchParams = useSearchParams()
  const tokens = searchParams.get('tokens') || '0'
  const reference = searchParams.get('reference') || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-slate-600 mb-6">
            Your tokens have been added to your account.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-6 h-6 text-emerald-600" />
              <div className="text-left">
                <p className="text-sm text-slate-600">Tokens Added</p>
                <p className="text-3xl font-bold text-emerald-600">{tokens}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left text-xs text-slate-600">
            <p className="font-mono">
              Reference: <span className="text-slate-900">{reference}</span>
            </p>
          </div>

          <Link href="/" className="block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Start Calculating
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TokenSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-slate-600">Processing your payment...</p>
          </div>
        </div>
      </div>
    }>
      <TokenSuccessContent />
    </Suspense>
  )
}
