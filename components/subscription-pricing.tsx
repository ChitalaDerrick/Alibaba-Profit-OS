'use client'

import { useState } from 'react'
import { Check, Zap } from 'lucide-react'

export const SUBSCRIPTION_PLANS = {
  daily: {
    name: 'Daily Access',
    price: 30,
    currency: 'KES',
    period: 'day',
    recurring: false,
    features: [
      'Unlimited calculations',
      'Save & export projects',
      'Generate reports',
      'Ad-free experience',
      'Access all features'
    ]
  },
  weekly: {
    name: 'Weekly Pass',
    price: 180,
    currency: 'KES',
    period: '7 days',
    recurring: true,
    features: [
      'Unlimited calculations',
      'Save & export projects',
      'Generate reports',
      'Ad-free experience',
      'Auto-renews weekly'
    ],
    savings: '14% off daily rate'
  },
  monthly: {
    name: 'Monthly Plan',
    price: 720,
    currency: 'KES',
    period: 'month',
    recurring: true,
    features: [
      'Unlimited calculations',
      'Save & export projects',
      'Generate reports',
      'Ad-free experience',
      'Auto-renews monthly'
    ],
    savings: '43% off daily rate'
  },
  annual: {
    name: 'Annual Plan',
    price: 2880,
    currency: 'KES',
    period: 'year',
    recurring: true,
    features: [
      'Unlimited calculations',
      'Save & export projects',
      'Generate reports',
      'Ad-free experience',
      'Auto-renews annually'
    ],
    savings: '74% off daily rate'
  }
}

interface SubscriptionPricingProps {
  onSelect: (planType: keyof typeof SUBSCRIPTION_PLANS) => void
  loading?: boolean
  selectedPlan?: keyof typeof SUBSCRIPTION_PLANS
}

export function SubscriptionPricing({ onSelect, loading = false, selectedPlan }: SubscriptionPricingProps) {
  const [hoveredPlan, setHoveredPlan] = useState<keyof typeof SUBSCRIPTION_PLANS | null>(null)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Unlock Full Access
        </h2>
        <p className="text-slate-600">
          Choose your subscription plan and start saving unlimited calculations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(SUBSCRIPTION_PLANS) as [keyof typeof SUBSCRIPTION_PLANS, typeof SUBSCRIPTION_PLANS.daily][]).map(([planType, plan]) => (
          <div
            key={planType}
            onMouseEnter={() => setHoveredPlan(planType)}
            onMouseLeave={() => setHoveredPlan(null)}
            className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              selectedPlan === planType
                ? 'border-blue-500 bg-blue-50'
                : hoveredPlan === planType
                ? 'border-slate-300 bg-slate-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            {plan.savings && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.savings}
                </span>
              </div>
            )}

            <div className="p-6 flex flex-col h-full">
              {/* Plan Name */}
              <h3 className="font-bold text-lg text-slate-900 mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-600">{plan.currency}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">per {plan.period}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => onSelect(planType)}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                  selectedPlan === planType
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : hoveredPlan === planType
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : 'Choose Plan'}
              </button>

              {/* Recurring Note */}
              {plan.recurring && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  Automatically renews. Cancel anytime.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold">Instant Access</p>
            <p>Your subscription activates immediately after payment. You can switch plans anytime.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
