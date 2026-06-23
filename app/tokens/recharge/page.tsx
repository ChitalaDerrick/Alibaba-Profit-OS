'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Zap, Check } from 'lucide-react'
import Link from 'next/link'

interface TokenPackage {
  id: string
  name: string
  token_amount: number
  price_kes: number
  discount_percent: number
  display_order: number
}

export default function RechargeTokensPage() {
  const [packages, setPackages] = useState<TokenPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    fetchPackages()
    fetchBalance()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/tokens/packages')
      const data = await res.json()
      if (data.packages) {
        setPackages(data.packages.sort((a: TokenPackage, b: TokenPackage) => a.display_order - b.display_order))
      }
    } catch (error) {
      console.error('[v0] Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/tokens/balance')
      const data = await res.json()
      setBalance(data.balance)
    } catch (error) {
      console.error('[v0] Failed to fetch balance:', error)
    }
  }

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId)
    try {
      const res = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      const data = await res.json()
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      }
    } catch (error) {
      console.error('[v0] Purchase failed:', error)
      alert('Failed to initiate payment')
    } finally {
      setPurchasing(null)
    }
  }

  const mostPopularId = packages[1]?.id

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Tokens: {balance}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-4">Recharge Tokens</h1>
          <p className="text-xl text-muted-foreground mb-2">Choose the token pack that fits your needs.</p>
          <div className="space-y-1 text-muted-foreground">
            <p>Pay securely with Paystack and keep calculating.</p>
            <p>Each token generates one calculation.</p>
          </div>
        </div>

        {/* Token Packages */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {packages.map((pkg) => {
              const isMostPopular = pkg.id === mostPopularId
              
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl p-8 border transition-all ${
                    isMostPopular
                      ? 'border-primary bg-gradient-to-b from-primary/5 to-background ring-2 ring-primary ring-opacity-30 transform scale-105 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  {/* Most Popular Badge */}
                  {isMostPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="inline-block bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold px-4 py-1 rounded-full text-xs">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Package Name */}
                  <h3 className="text-lg font-semibold mb-6">{pkg.name}</h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2">KES {pkg.price_kes.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Recharge instantly.</div>
                  </div>

                  {/* Tokens */}
                  <div className="mb-8 p-4 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-5 h-5 ${isMostPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-lg font-semibold">{pkg.token_amount} Tokens</span>
                    </div>
                  </div>

                  {/* Discount Badge */}
                  {pkg.discount_percent > 0 && (
                    <div className="mb-6 inline-block bg-accent/10 border border-accent text-accent px-3 py-1 rounded-lg text-xs font-semibold">
                      Save {pkg.discount_percent}%
                    </div>
                  )}

                  {/* Buy Button */}
                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasing === pkg.id}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isMostPopular
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50'
                        : 'border border-border text-foreground hover:border-primary/50 hover:bg-secondary disabled:opacity-50'
                    }`}
                  >
                    {purchasing === pkg.id ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto border-t border-border pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Check className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Instant delivery</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Check className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Tokens never expire</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Check className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Download and use anywhere</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
