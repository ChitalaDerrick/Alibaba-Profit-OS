import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import Link from 'next/link' // Used for sign-up, sign-in links

interface SignupGateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignupGateModal({ isOpen, onClose }: SignupGateModalProps) {
  if (!isOpen) return null

  const plans = [
    { name: 'Daily', price: '50', period: '24 hours' },
    { name: 'Monthly', price: '1,200', period: 'month' },
    { name: 'Yearly', price: '10,000', period: 'year', highlighted: true },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Unlock Full Access
            </h2>
            <p className="text-slate-600">
              You&apos;ve completed your 100 free calculations. Upgrade to continue with unlimited access and premium features.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Unlimited Calculations</p>
                <p className="text-xs text-slate-500">Run as many profit analyses as you need</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Save & Export Reports</p>
                <p className="text-xs text-slate-500">Store your calculations and download as PDF or CSV</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Ad-Free Experience</p>
                <p className="text-xs text-slate-500">Clean interface, no interruptions</p>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Choose Your Plan</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <Link 
                  key={plan.name} 
                  href={`/checkout?plan=${plan.name.toLowerCase()}`}
                  className="block"
                >
                  <div className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                    plan.highlighted
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                    <p className="font-semibold text-slate-900 text-sm">{plan.name}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-500">KES</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">per {plan.period}</p>
                    {plan.highlighted && (
                      <p className="text-xs font-semibold text-blue-600 mt-2">⭐ BEST VALUE</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-900">
              <span className="font-semibold">How it works:</span> Click a plan above to proceed to payment. After successful payment, you&apos;ll create your account and get instant access.
            </p>
          </div>

          {/* Continue with Free Trial Option */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Continue with Free Trial
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
