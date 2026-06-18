'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Zap, Loader2, Check } from 'lucide-react'

interface TokenPackage {
  id: string
  name: string
  token_amount: number
  price_kes: number
  discount_percent: number
}

interface TokenPurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TokenPurchaseModal({
  open,
  onOpenChange,
  onSuccess,
}: TokenPurchaseModalProps) {
  const [packages, setPackages] = useState<TokenPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchPackages()
    }
  }, [open])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/tokens/packages')
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error('[v0] Failed to fetch packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId)
    try {
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Paystack checkout
        if (data.authorizationUrl) {
          window.location.href = data.authorizationUrl
        } else {
          console.error('[v0] No authorization URL in response:', data)
          alert('Failed to get payment authorization URL')
        }
      } else {
        const error = await response.json()
        console.error('[v0] Payment initialization failed:', error)
        alert(error.error || 'Payment initialization failed')
      }
    } catch (error) {
      console.error('[v0] Purchase error:', error)
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Buy Tokens
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => {
              const savings =
                pkg.discount_percent > 0
                  ? Math.round((pkg.price_kes * pkg.discount_percent) / 100)
                  : 0

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-xl border-2 p-4 transition-all ${
                    pkg.discount_percent > 0
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {pkg.discount_percent > 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Save {pkg.discount_percent}%
                      </span>
                    </div>
                  )}

                  <div className="mt-2">
                    <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-emerald-600">
                          {pkg.token_amount}
                        </span>
                        <span className="text-sm text-slate-600">tokens</span>
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        KES {pkg.price_kes.toLocaleString()}
                        {savings > 0 && (
                          <span className="text-xs text-emerald-600 ml-2">
                            (Save KES {savings})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        KES {(pkg.price_kes / pkg.token_amount).toFixed(2)}/token
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchasing === pkg.id}
                    className={`w-full mt-4 transition-all ${
                      pkg.discount_percent > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {purchasing === pkg.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            Each calculation costs approximately 0.14 tokens. With 10 tokens, you can perform ~70 calculations. Free users start with 10 tokens.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
