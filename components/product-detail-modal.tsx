"use client"

import { X } from "lucide-react"
import { formatCurrency } from "@/lib/calculator-store"

interface Product {
  id: string
  product_name: string
  unit_cost: number
  unit_sale: number
  quantity: number
  profit_margin: number
  total_profit: number
}

interface ProductDetailModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
}

export function ProductDetailModal({ isOpen, product, onClose }: ProductDetailModalProps) {
  if (!isOpen || !product) return null

  const profitMarginColor = product.profit_margin >= 30 ? "text-emerald-600" : product.profit_margin >= 0 ? "text-blue-600" : "text-red-600"
  const profitColor = product.total_profit >= 0 ? "text-emerald-600" : "text-red-600"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Product Breakdown</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <p className="text-sm text-slate-500 mb-1">Product Name</p>
            <p className="text-lg font-bold text-slate-900">{product.product_name}</p>
          </div>

          {/* Cost & Sale Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Unit Cost</p>
              <p className="text-lg font-bold text-slate-900">KES {formatCurrency(product.unit_cost)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Unit Sale</p>
              <p className="text-lg font-bold text-slate-900">KES {formatCurrency(product.unit_sale)}</p>
            </div>
          </div>

          {/* Quantity */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Quantity</p>
            <p className="text-lg font-bold text-slate-900">{product.quantity} units</p>
          </div>

          {/* Profit Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Profit Margin</span>
              <span className={`font-bold ${profitMarginColor}`}>
                {typeof product.profit_margin === 'number' ? product.profit_margin.toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Profit</span>
              <span className={`font-bold ${profitColor}`}>
                KES {formatCurrency(product.total_profit)}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
