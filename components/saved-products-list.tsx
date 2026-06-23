"use client"

import { useEffect, useState } from "react"
import { useSavedProducts } from "@/lib/secure-hooks"
import { formatCurrency } from "@/lib/calculator-store"
import { Trash2, Package } from "lucide-react"
import { ProductDetailModal } from "./product-detail-modal"

interface SavedProductsListProps {
  onUpgradeClick: () => void
}

export function SavedProductsList({ onUpgradeClick }: SavedProductsListProps) {
  const { products, isLoading, fetchProducts, deleteProduct } = useSavedProducts()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Load products on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (isLoading) return null
  if (products.length === 0) return null

  return (
    <>
      <ProductDetailModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900">Saved Products</h2>
            <span className="text-sm text-slate-500">({products.length})</span>
          </div>
        </div>

        {/* Minimal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer p-4 group"
            >
              {/* Product Name */}
              <div className="mb-3">
                <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {product.product_name || "Unnamed"}
                </p>
              </div>

              {/* Key Metrics - Minimal */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cost</span>
                  <span className="font-medium text-slate-900">KES {formatCurrency(product.unit_cost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sale</span>
                  <span className="font-medium text-slate-900">KES {formatCurrency(product.unit_sale)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Profit</span>
                  <span className={`font-bold ${product.total_profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    KES {formatCurrency(product.total_profit)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Margin</span>
                  <span className={`font-medium ${product.profit_margin >= 30 ? "text-emerald-600" : product.profit_margin >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {typeof product.profit_margin === 'number' ? product.profit_margin.toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProduct(product.id)
                }}
                className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>

              {/* Click hint */}
              <p className="mt-2 text-xs text-slate-400 text-center">Click to view details</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
