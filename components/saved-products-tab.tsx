"use client"

import { SavedProductsList } from "./saved-products-list"
import { Lock, Package } from "lucide-react"

interface SavedProductsTabProps {
  isAuthenticated: boolean
  onSignupClick: () => void
  onReportsClick: () => void
}

export function SavedProductsTab({ isAuthenticated, onSignupClick, onReportsClick }: SavedProductsTabProps) {

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl">
        <div className="relative">
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">Saved Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-slate-200/80 p-4">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
            <div className="text-center">
              <Lock className="w-12 h-12 text-white mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">Save & Organize Your Products</h3>
              <p className="text-white/80 text-sm mb-4 max-w-xs">
                Create an account to save calculations, organize them into projects, and export professional reports.
              </p>
              <button
                onClick={onSignupClick}
                className="px-6 py-2.5 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <SavedProductsList onUpgradeClick={onReportsClick} />
}
