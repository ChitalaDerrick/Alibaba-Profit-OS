'use client'

import { Check, Zap, TrendingUp, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Package {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  highlighted?: boolean
  cta?: string
  perSaving?: string
}

const SUBSCRIPTION_PLANS: Package[] = [
  {
    id: 'daily',
    name: 'Daily Access',
    price: 50,
    period: 'day',
    features: [
      'Unlimited calculations for 24 hours',
      'View detailed profit breakdowns',
      'Export calculation results',
      'Ad-free experience'
    ],
    cta: 'Try for KES 50'
  },
  {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 300,
    period: 'week',
    features: [
      'Unlimited calculations for 7 days',
      'Save unlimited products',
      'Generate PDF reports',
      'Email support',
      'Save 15% vs daily'
    ],
    cta: 'Upgrade to Weekly',
    perSaving: '42/day'
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 1200,
    period: 'month',
    highlighted: true,
    features: [
      'Unlimited calculations all month',
      'Save unlimited products',
      'Advanced analytics',
      'Generate PDF & Excel reports',
      'Priority email support',
      'Save 40% vs daily'
    ],
    cta: 'Most Popular',
    perSaving: '40/day'
  },
  {
    id: 'annual',
    name: 'Annual Plan',
    price: 12000,
    period: 'year',
    features: [
      'Full access year-round',
      'All monthly features',
      'API access',
      'Dedicated support',
      'Save 60% vs daily',
      'Best value'
    ],
    cta: 'Get Best Deal',
    perSaving: '33/day'
  }
]

export function FreeTierExhaustedPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly')
  const [loading, setLoading] = useState(false)

  const handlePurchase = async (planId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscriptions/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await response.json()
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Lock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">You've unlocked premium access</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Your Free Trials<br className="hidden sm:block" /> Are Used Up
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-8">
              You've calculated 10 product scenarios. Upgrade now to unlock unlimited calculations, save products, and grow your business.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-cyan-400">10</div>
                <div className="text-sm text-slate-400">Calculations Done</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">∞</div>
                <div className="text-sm text-slate-400">Available Today</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400">40%</div>
                <div className="text-sm text-slate-400">Monthly Savings</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-slate-400">Full Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl transition-all duration-300 cursor-pointer group ${
                  plan.highlighted
                    ? 'lg:scale-105 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/50 ring-2 ring-blue-500/30'
                    : 'bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        KES {plan.price.toLocaleString()}
                      </span>
                      <span className="text-slate-400">/{plan.period}</span>
                    </div>
                    {plan.perSaving && (
                      <p className="text-sm text-green-400 mt-2">Only {plan.perSaving}/day</p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-200">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePurchase(plan.id)
                    }}
                    disabled={loading && selectedPlan === plan.id}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mt-16 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">What You Get</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Unlimited Calculations</h3>
                  <p className="text-slate-400">Run as many profit calculations as you need. No limits, no waiting.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20">
                    <Check className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Save & Manage Products</h3>
                  <p className="text-slate-400">Store all your product calculations and access them anytime.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-500/20">
                    <Lock className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Advanced Reports</h3>
                  <p className="text-slate-400">Export detailed PDF and Excel reports for your business.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Back to Calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
