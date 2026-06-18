import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import Link from 'next/link'

export function LockedFeature() {
  return (
    <div className="mt-8 p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
        <Lock className="w-6 h-6 text-slate-600" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-slate-900">Save & Export Locked</h3>
        <p className="text-sm text-slate-600">
          Create an account to save your calculations and export reports
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/auth/sign-up">
          <Button>Create Account</Button>
        </Link>
        <Link href="/auth/login">
          <button className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  )
}
