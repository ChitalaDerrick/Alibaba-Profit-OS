'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TokenErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-slate-600 mb-6">
            We couldn&apos;t process your payment. Please try again or contact support if the problem persists.
          </p>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Go Back Home
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
