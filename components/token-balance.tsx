'use client'

import { useState, useEffect } from 'react'
import { Zap, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface TokenBalance {
  balance: number
  lifetime_purchased: number
}

export function TokenBalance() {
  const [balance, setBalance] = useState<TokenBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    fetchBalance()
    // Poll balance every 5 seconds
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/tokens/balance')
      if (response.ok) {
        const data = await response.json()
        setBalance({
          balance: data.balance,
          lifetime_purchased: data.lifetime_purchased,
        })
      } else if (response.status === 401) {
        // User not authenticated - don't show balance
        console.log('[v0] User not authenticated, hiding token balance')
        setBalance(null)
      } else {
        console.error('[v0] Failed to fetch token balance:', response.statusText)
        setBalance(null)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch token balance:', error)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 animate-pulse">
        <Zap className="w-4 h-4 text-slate-300" />
        <span className="text-sm font-semibold text-slate-400">--</span>
      </div>
    )
  }

  if (!balance) {
    // Not logged in
    return null
  }

  const isLow = balance.balance <= 5
  const isOutOfTokens = balance.balance === 0

  return (
    <div className="relative">
      <Link href="/tokens/recharge">
        <button
          onClick={() => setShowTooltip(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            isOutOfTokens
              ? 'bg-red-100 text-red-700 ring-2 ring-red-300 hover:bg-red-200'
              : isLow
              ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-300 hover:bg-orange-200'
              : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 ring-2 ring-emerald-200'
          }`}
        >
          <Zap
            className={`w-4 h-4 ${
              isOutOfTokens
                ? 'text-red-500'
                : isLow
                ? 'text-orange-500'
                : 'text-emerald-500'
            }`}
          />
          <span>{balance.balance}</span>
          {isOutOfTokens && <AlertCircle className="w-3.5 h-3.5" />}
        </button>
      </Link>

      {/* Tooltip on hover */}
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="absolute inset-0 w-full"
      />

      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 text-white rounded-lg p-4 shadow-2xl z-50">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Token Balance
              </p>
              <p className="text-2xl font-bold text-white">{balance.balance}</p>
            </div>
            
            <div className="border-t border-slate-700 pt-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Lifetime Purchased
              </p>
              <p className="text-lg font-semibold text-emerald-400">{balance.lifetime_purchased}</p>
            </div>

            {isOutOfTokens && (
              <div className="border-t border-slate-700 pt-3 bg-red-500/10 -mx-4 px-4 py-3 rounded-lg">
                <p className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  Out of Tokens
                </p>
                <p className="text-sm text-red-100 mt-1">
                  Click to purchase more tokens
                </p>
              </div>
            )}

            {isLow && !isOutOfTokens && (
              <div className="border-t border-slate-700 pt-3 bg-orange-500/10 -mx-4 px-4 py-3 rounded-lg">
                <p className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Running Low
                </p>
                <p className="text-sm text-orange-100 mt-1">
                  Click to purchase more tokens
                </p>
              </div>
            )}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-900 transform rotate-45" />
        </div>
      )}
    </div>
  )
}
