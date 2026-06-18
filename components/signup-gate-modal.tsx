import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import Link from 'next/link'

interface SignupGateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignupGateModal({ isOpen, onClose }: SignupGateModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
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
              Free Trial Complete
            </h2>
            <p className="text-slate-600">
              You&apos;ve used your 70 free calculations. Create an account to continue with unlimited access.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Unlimited Calculations</p>
                <p className="text-xs text-slate-500">Run as many profit analyses as you need</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Save & Export</p>
                <p className="text-xs text-slate-500">Store your calculations and download reports</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Ad-Free Experience</p>
                <p className="text-xs text-slate-500">No more ads, clean interface</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/auth/sign-up" className="block">
              <Button className="w-full" size="lg">
                Create Account
              </Button>
            </Link>
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
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
