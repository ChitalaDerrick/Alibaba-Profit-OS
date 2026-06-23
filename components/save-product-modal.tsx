'use client'

import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { useCalculator, formatCurrency } from '@/lib/calculator-store'
import { useSavedProducts } from '@/lib/secure-hooks'

interface SaveProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function SaveProductModal({ isOpen, onClose, onSuccess }: SaveProductModalProps) {
  const { state, results } = useCalculator()
  const { addProduct } = useSavedProducts()
  const [productName, setProductName] = useState(state.itemName || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSave = async () => {
    if (!productName.trim()) {
      setError('Please enter a product name')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const result = await addProduct({
        productName: productName.trim(),
        unitCost: state.unitCost,
        unitSale: state.unitSale,
        quantity: state.quantity,
        profitMargin: results.margin.toFixed(1),
        totalProfit: results.netProfit,
      })

      if (result) {
        setProductName('')
        onClose()
        onSuccess?.()
      } else {
        setError('Failed to save product. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while saving the product.')
      console.error('[v0] Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Save Product</h2>
            <p className="text-slate-600">
              Give this calculation a name to save it for later reference.
            </p>
          </div>

          {/* Product Summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Unit Cost:</span>
              <span className="font-semibold text-slate-900">
                KES {formatCurrency(state.unitCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Unit Sale:</span>
              <span className="font-semibold text-slate-900">
                KES {formatCurrency(state.unitSale)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Quantity:</span>
              <span className="font-semibold text-slate-900">{state.quantity}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
              <span className="text-slate-600 font-medium">Net Profit:</span>
              <span
                className={`font-bold ${
                  results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                KES {formatCurrency(results.netProfit)}
              </span>
            </div>
          </div>

          {/* Product Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Samsung Galaxy A53"
              disabled={isSaving}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !productName.trim()}
              className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-full px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Your product will be saved to "Saved Products" tab
          </p>
        </div>
      </div>
    </div>
  )
}
