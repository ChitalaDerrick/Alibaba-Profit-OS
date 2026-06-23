"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { InputPanel } from "@/components/input-panel"
import { DashboardPanel } from "@/components/dashboard-panel"
import { SavedProductsTab } from "@/components/saved-products-tab"
import { ReportsTab } from "@/components/reports-tab"
import { AffiliateRecommendations } from "@/components/affiliate-recommendations"
import { SignupGateModal } from "@/components/signup-gate-modal"
import { FreeCalculationsCounter } from "@/components/free-calculations-counter"
import { useSubscription } from "@/lib/subscription-hooks"
import { useCalculator } from "@/lib/calculator-store"
import { useAuth } from "@/lib/auth-hooks"

export default function Home() {
  const [showPaywall, setShowPaywall] = useState(false)
  const [showSignupGate, setShowSignupGate] = useState(false)
  const [activeTab, setActiveTab] = useState('calculator')
  const { subscription: currentSubscription } = useSubscription()
  const { user, isLoading: authLoading } = useAuth()
  const { state } = useCalculator()

  const isAuthenticated = !!user
  const hasActiveSubscription = currentSubscription?.isActive && currentSubscription?.type !== 'free'
  const isSuperUser = currentSubscription?.type === 'super_user'
  const hasFullAccess = hasActiveSubscription || isSuperUser

  const handleTabClick = (tab: string) => {
    // Lock saved products and reports behind subscription (super users bypass)
    if ((tab === 'saved' || tab === 'reports') && !hasFullAccess) {
      setShowSignupGate(true)
      return
    }
    setActiveTab(tab)
  }

  // Don't render until auth is loaded
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-3 font-semibold text-sm transition-all duration-200 relative ${
              activeTab === 'calculator'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Calculator
            {activeTab === 'calculator' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-3 font-semibold text-sm transition-all duration-200 relative ${
              activeTab === 'partners'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Partners & Resources
            {activeTab === 'partners' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabClick('saved')}
            className={`px-4 py-3 font-semibold text-sm transition-all duration-200 relative flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'text-slate-900'
                : hasFullAccess
                ? 'text-slate-500 hover:text-slate-700'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            Saved Products
            {!hasFullAccess && <span className="text-xs">🔒</span>}
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabClick('reports')}
            className={`px-4 py-3 font-semibold text-sm transition-all duration-200 relative flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'text-slate-900'
                : hasFullAccess
                ? 'text-slate-500 hover:text-slate-700'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            Reports
            {!hasFullAccess && <span className="text-xs">🔒</span>}
            {activeTab === 'reports' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <>
            {/* Free calculations counter for unauthenticated users */}
            {!isAuthenticated && (
              <div className="max-w-4xl mx-auto mb-6">
                <FreeCalculationsCounter isAuthenticated={isAuthenticated} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <InputPanel />
              <DashboardPanel 
                canSave={isAuthenticated}
                onSaveDisabled={() => setShowSignupGate(true)}
                isAuthenticated={isAuthenticated}
                onCalculationExhausted={() => setShowSignupGate(true)}
              />
            </div>
          </>
        )}

        {/* Partners & Resources Tab */}
        {activeTab === 'partners' && (
          <div className="max-w-2xl">
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-3xl p-6 lg:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Partners & Resources
                </h2>
                <p className="text-slate-600">
                  Recommended tools and services to help you scale your e-commerce business
                </p>
              </div>
              <AffiliateRecommendations />
            </div>
          </div>
        )}

        {/* Saved Products Tab */}
        {activeTab === 'saved' && (
          <SavedProductsTab 
            isAuthenticated={isAuthenticated}
            onSignupClick={() => setShowSignupGate(true)}
            onReportsClick={() => setActiveTab('reports')}
          />
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <ReportsTab 
            isAuthenticated={isAuthenticated}
            onSignupClick={() => setShowSignupGate(true)}
          />
        )}
      </main>
      
      <SignupGateModal 
        isOpen={showSignupGate}
        onClose={() => setShowSignupGate(false)}
      />
    </div>
  )
}

