"use client"

import { useEffect, useState } from "react"
import { useSavedProducts, useSubscriptionStatus } from "@/lib/secure-hooks"
import { formatCurrency } from "@/lib/calculator-store"
import { Lock, Trash2, ChevronDown, ChevronUp, Package } from "lucide-react"

interface SavedProductsListProps {
  onUpgradeClick: () => void
}

export function SavedProductsList({ onUpgradeClick }: SavedProductsListProps) {
  const { products, isLoading, fetchProducts, deleteProduct } = useSavedProducts()
  const { subscription, fetchSubscription } = useSubscriptionStatus()
  const [showAll, setShowAll] = useState(false)

  // Load products and subscription on mount
  useEffect(() => {
    fetchProducts()
    fetchSubscription()
  }, [fetchProducts, fetchSubscription])

  if (isLoading) return null
  if (products.length === 0) return null

  const isPro = subscription?.isPro || false
  const FREE_VISIBLE = 3
  const visibleProducts = isPro || showAll ? products : products.slice(0, FREE_VISIBLE)
  const hiddenCount = products.length - FREE_VISIBLE
  const hasHidden = !isPro && hiddenCount > 0

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Saved Products</h2>
          <span className="text-sm text-slate-500">({products.length})</span>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Product</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Cost</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Sale</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Qty</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Profit</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Margin</th>
                <th className="text-center py-3 px-4 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-900">{product.product_name || "Unnamed"}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    KES {formatCurrency(product.unit_cost)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    KES {formatCurrency(product.unit_sale)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {product.quantity}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    product.total_profit >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    KES {formatCurrency(product.total_profit)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    product.profit_margin >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {typeof product.profit_margin === 'number' ? product.profit_margin.toFixed(1) : '0.0'}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hidden products indicator for free users */}
        {hasHidden && (
          <button
            onClick={onUpgradeClick}
            className="w-full py-4 px-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-100 flex items-center justify-center gap-3 hover:from-orange-50 hover:to-amber-50 transition-colors group"
          >
            <div className="flex items-center gap-2 text-slate-500 group-hover:text-orange-600 transition-colors">
              <Lock className="w-4 h-4" />
              <span className="font-medium">
                +{hiddenCount} more saved product{hiddenCount !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full">
              Upgrade to view
            </span>
          </button>
        )}

        {/* Show more/less for Pro users */}
        {isPro && products.length > FREE_VISIBLE && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-3 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show all ({products.length})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
