"use client"

import { useEffect, useState } from "react"
import { useSavedProducts } from "@/lib/secure-hooks"
import { formatCurrency } from "@/lib/calculator-store"
import { Trash2, ChevronDown, ChevronUp, Package, Download } from "lucide-react"

interface SavedProductsTabProps {
  isAuthenticated: boolean
  onSignupClick: () => void
  onReportsClick: () => void
}

export function SavedProductsTab({ isAuthenticated, onSignupClick, onReportsClick }: SavedProductsTabProps) {
  const { products, isLoading, fetchProducts, deleteProduct } = useSavedProducts()
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated, fetchProducts])

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
                <span className="text-sm text-slate-500">(0)</span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-3 px-4">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

  if (isLoading) {
    return <div className="text-center text-slate-500">Loading products...</div>
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved products yet</h3>
          <p className="text-slate-500">Start calculating to save your products here</p>
        </div>
      </div>
    )
  }

  const FREE_VISIBLE = 3
  const visibleProducts = showAll ? products : products.slice(0, FREE_VISIBLE)
  const hiddenCount = products.length - FREE_VISIBLE
  const hasHidden = hiddenCount > 0

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Saved Products</h2>
          <span className="text-sm text-slate-500">({products.length})</span>
        </div>
        <button
          onClick={onReportsClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors font-medium text-sm"
        >
          <Download className="w-4 h-4" />
          Generate Report
        </button>
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

        {/* Show more/less button */}
        {hasHidden && (
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
