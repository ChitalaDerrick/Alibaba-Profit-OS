"use client"

import { Info, Save, Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useCalculator, formatCurrency } from "@/lib/calculator-store"
import { incrementFreeCalculations, hasExhaustedFreeCalculations } from "@/lib/free-calculations"
import { NativeAdTile } from "./native-ad-tile"

interface DashboardPanelProps {
  onSaveDisabled?: () => void
  canSave?: boolean
  isAuthenticated?: boolean
  onCalculationExhausted?: () => void
}

export function DashboardPanel({ onSaveDisabled, canSave = true, isAuthenticated = false, onCalculationExhausted }: DashboardPanelProps) {
  const { state, results } = useCalculator()
  const [justSaved, setJustSaved] = useState(false)
  const prevNetProfitRef = useRef<number | null>(null)

  // Track when a new calculation occurs
  // A calculation is complete when:
  // 1. Cost, Sale Price, and Quantity are filled
  // 2. AND shipping info is entered (either weight for AIR or dimensions for SEA)
  useEffect(() => {
    if (isAuthenticated) return // Don't track for authenticated users
    
    // Check if calculation is complete (has shipping info)
    const hasShippingInfo = 
      (state.shippingMethod === "AIR" && state.weight > 0) ||
      (state.shippingMethod === "SEA" && state.length > 0 && state.width > 0 && state.height > 0)
    
    const hasBasicInfo = state.unitCost > 0 && state.unitSale > 0 && state.quantity > 0
    
    const isCalculationComplete = hasBasicInfo && hasShippingInfo
    
    // Create a unique calculation signature from all input values
    const calculationSignature = JSON.stringify({
      itemName: state.itemName,
      unitCost: state.unitCost,
      quantity: state.quantity,
      unitSale: state.unitSale,
      weight: state.weight,
      length: state.length,
      width: state.width,
      height: state.height,
      airRate: state.airRate,
      seaRate: state.seaRate,
      adBudget: state.adBudget,
      shippingMethod: state.shippingMethod,
    })
    
    // Store the signature and compare on next render
    // Only increment counter if calculation is complete AND inputs have changed
    if (isCalculationComplete && prevNetProfitRef.current !== calculationSignature && prevNetProfitRef.current !== null) {
      const updated = incrementFreeCalculations()
      console.log('[v0] Complete calculation tracked. Remaining:', 10 - updated)
      
      // Check if user just exhausted their free calculations
      if (hasExhaustedFreeCalculations()) {
        console.log('[v0] Free calculations exhausted!')
        onCalculationExhausted?.()
      }
    }
    
    prevNetProfitRef.current = calculationSignature
  }, [state, isAuthenticated, onCalculationExhausted])

  const handleSave = async () => {
    // If user is NOT authenticated, show signup gate instead of saving
    if (!isAuthenticated) {
      console.log('[v0] Unauthenticated user trying to save - showing signup gate')
      // Parent component will handle this via onSaveDisabled
      onSaveDisabled?.()
      return
    }

    try {
      const payload = {
        productName: state.itemName || `Product ${Date.now()}`,
        unitCost: state.unitCost,
        unitSale: state.unitSale,
        quantity: state.quantity,
        profitMargin: parseFloat((results.profitMargin || 0).toFixed(1)),
        totalProfit: results.netProfit,
      }
      
      // Save product directly without modal
      const response = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save product')
      }

      // Show success indicator
      setJustSaved(true)
      
      // Reload page after short delay to show success feedback
      setTimeout(() => {
        window.location.href = window.location.href
      }, 1500)
    } catch (error) {
      console.error('[v0] Save error:', error)
      alert(`Error saving product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const canSaveProduct = state.unitCost > 0 && state.unitSale > 0

  // Calculate bar percentages
  const invPercent =
    results.totalSales > 0
      ? Math.max(0, (results.totalBuying / results.totalSales) * 100)
      : 0
  const shipPercent =
    results.totalSales > 0
      ? Math.max(0, (results.totalShipping / results.totalSales) * 100)
      : 0
  const adsPercent =
    results.totalSales > 0
      ? Math.max(0, (state.adBudget / results.totalSales) * 100)
      : 0
  const profitPercent = Math.max(
    0,
    100 - invPercent - shipPercent - adsPercent
  )

  const isLowMargin = results.margin < 15
  const isNegativeProfit = results.netProfit < 0

  return (
    <div className="lg:col-span-8 space-y-6 sm:space-y-7">
      {/* Main KPI Card */}
      <div className="bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-12 gap-4 md:gap-6">
            <div className="flex-1">
              <div className="text-xs font-black tracking-widest text-blue-400 uppercase mb-2">
                {state.itemName || "PRODUCT ANALYSIS"}
              </div>
              <h3 className="text-sm font-medium text-slate-400">
                Projected Net Profit
              </h3>
              <div
                className={`text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter mt-2 ${
                  isNegativeProfit ? "text-red-400" : "text-white"
                }`}
              >
                KES {formatCurrency(results.netProfit)}
              </div>
            </div>
            <div
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap ${
                isLowMargin
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              }`}
            >
              {results.margin.toFixed(1)}% MARGIN
            </div>
          </div>

          {/* Save Button */}
          {canSaveProduct && (
            <button
              onClick={handleSave}
              disabled={justSaved}
              className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                justSaved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : !isAuthenticated
                  ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : !isAuthenticated ? (
                <>
                  <Save className="w-4 h-4" />
                  Create Account to Save
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Product
                </>
              )}
            </button>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1 line-clamp-1">
                Gross Sales
              </p>
              <p className="text-sm sm:text-xl font-bold">
                {formatCurrency(results.totalSales)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1 line-clamp-1">
                Markup %
              </p>
              <p className="text-sm sm:text-xl font-bold">{results.markup.toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1 line-clamp-1">
                Shipping Total
              </p>
              <p className="text-sm sm:text-xl font-bold">
                {formatCurrency(results.totalShipping)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase mb-1 line-clamp-1">
                Unit B-Even
              </p>
              <p className="text-sm sm:text-xl font-bold">
                {formatCurrency(results.breakEven)}
              </p>
            </div>
          </div>

          {/* Progress Waterfall */}
          <div className="mt-12 space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Expense Distribution</span>
              <span className="text-slate-400">Sales Coverage</span>
            </div>
            <div className="h-5 w-full bg-white/5 rounded-full flex overflow-hidden p-1 gap-1 border border-white/10">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-700"
                style={{ width: `${invPercent}%` }}
              />
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${shipPercent}%` }}
              />
              <div
                className="h-full bg-slate-600 rounded-full transition-all duration-700"
                style={{ width: `${adsPercent}%` }}
              />
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${profitPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-6 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Product
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Shipping
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Ads
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Net Profit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col justify-between">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Inventory Load
          </p>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {formatCurrency(results.totalBuying)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1">
              Total purchasing cost
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col justify-between">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Logistic Metrics
          </p>
          <div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Total Shipping</p>
                <p className="text-lg sm:text-2xl font-extrabold text-slate-800">
                  {formatCurrency(results.totalShipping)}
                </p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold line-clamp-1">Per Unit ({state.shippingMethod})</p>
                <p className="text-base sm:text-lg font-bold text-slate-700">
                  {formatCurrency(results.unitShipCost)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col justify-between">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Load Volume
          </p>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {state.shippingMethod === "AIR"
                ? results.totalLoad.toFixed(2)
                : results.totalLoad.toFixed(4)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1">
              Total {state.shippingMethod === "AIR" ? "KG" : "CBM"}
            </p>
          </div>
        </div>
      </div>

      {/* Tips & Meta */}
      <div className="bg-blue-600 rounded-xl sm:rounded-[2rem] p-4 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-3 sm:gap-6 shadow-xl shadow-blue-100">
        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
          <Info className="w-6 sm:w-8 h-6 sm:h-8" />
        </div>
        <div>
          <h4 className="font-bold text-base sm:text-lg">Pro Profit Tip</h4>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Aim for a minimum of <strong>30% margin</strong> to cover hidden
            operational costs like returns, broken items, and transaction fees.
          </p>
        </div>
      </div>

      {/* Save Product Button - Show to authenticated users */}
      {isAuthenticated && (
        <button
          onClick={handleSave}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
        >
          <Save className="w-5 h-5 group-hover:animate-pulse" />
          <span>{justSaved ? "Product Saved Successfully!" : "Save Product"}</span>
          {justSaved && <Check className="w-5 h-5" />}
        </button>
      )}

      {/* Native Ad Tile - Show to unauthenticated users */}
      <NativeAdTile 
        isVisible={!isAuthenticated}
        adUrl="https://www.shopify.com"
        adTitle="Scale Your Business"
        adDescription="Discover powerful e-commerce tools and resources that help you manage your store more efficiently and grow your sales."
      />
    </div>
  )
}
