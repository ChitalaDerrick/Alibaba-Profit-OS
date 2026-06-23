"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { InputPanel } from "@/components/input-panel"
import { DashboardPanel } from "@/components/dashboard-panel"
import { PaywallModal } from "@/components/paywall-modal"
import { SavedProductsTab } from "@/components/saved-products-tab"
import { ReportsTab } from "@/components/reports-tab"
import { AffiliateRecommendations } from "@/components/affiliate-recommendations"
import { SignupGateModal } from "@/components/signup-gate-modal"
import { useSubscriptionStatus } from "@/lib/secure-hooks"
import { useSubscription } from "@/lib/subscription-hooks"
import { useCalculator } from "@/lib/calculator-store"
import { useAuth } from "@/lib/auth-hooks"

export default function Home() {
  const [showPaywall, setShowPaywall] = useState(false)
  const [showSignupGate, setShowSignupGate] = useState(false)
  const [activeTab, setActiveTab] = useState('calculator')
  const { subscription, fetchSubscription } = useSubscriptionStatus()
  const { subscription: currentSubscription } = useSubscription()
  const { user, isLoading: authLoading } = useAuth()
  const { state } = useCalculator()
  const [sessionTokens, setSessionTokens] = useState(70) // Free tier: 70 calculations

  useEffect(() => {
    if (user) {
      // User is authenticated - fetch their subscription status from DB
      fetchSubscription()
    } else {
      // User is NOT authenticated - use session-based tracking from localStorage
      const savedTokens = localStorage.getItem('session_tokens')
      if (savedTokens) {
        setSessionTokens(parseInt(savedTokens))
      }
    }
  }, [user, fetchSubscription])

  const tokenBalance = user ? (subscription?.remaining || 0) : sessionTokens
  const isOutOfTokens = tokenBalance <= 0
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

  const handleTokensDeducted = () => {
    if (!isAuthenticated) {
      // Deduct from session tokens
      const newBalance = Math.max(0, sessionTokens - 1)
      setSessionTokens(newBalance)
      localStorage.setItem('session_tokens', newBalance.toString())
      
      // Show signup gate if free tokens exhausted
      if (newBalance <= 0) {
        setShowSignupGate(true)
      }
    } else {
      // Refresh token balance from DB
      fetchSubscription()
    }
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <InputPanel onCalculate={handleTokensDeducted} />
              <DashboardPanel 
                canSave={isAuthenticated}
                onSaveDisabled={() => isAuthenticated ? setShowPaywall(true) : setShowSignupGate(true)}
                isAuthenticated={isAuthenticated}
              />
            </div>

            {/* Saved Products List - Only show to authenticated users */}
            {isAuthenticated && (
              <SavedProductsList 
                onUpgradeClick={() => setShowPaywall(true)} 
              />
            )}
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
          <ReportsTab />
        )}

        {/* Out of tokens overlay - For authenticated users */}
        {isAuthenticated && isOutOfTokens && subscription && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
            <button
              onClick={() => setShowPaywall(true)}
              className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-2xl px-8 py-4 flex items-center gap-3 hover:shadow-2xl transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H9.5V.5h1v1zm0 17H9.5v1h1v-1zM19 10.5v-1h1v1h-1zM0 10.5v-1h1v1H0zm13.657-5.657L14.07 4.07l.707-.707-.706.707zm-7.314 7.314L6.93 15.93l-.707.707.706-.707zm7.314 0L14.07 15.93l.707.707-.706-.707zm-7.314-7.314L6.93 4.07l-.707-.707.706.707zM10 5a5 5 0 110 10 5 5 0 010-10z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Out of tokens</p>
                <p className="text-sm text-slate-500">Click to buy more</p>
              </div>
            </button>
          </div>
        )}
      </main>

      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
      
      <SignupGateModal 
        isOpen={showSignupGate}
        onClose={() => setShowSignupGate(false)}
      />
    </div>
  )
}

