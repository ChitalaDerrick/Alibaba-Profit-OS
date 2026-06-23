"use client"

import { Info, Save, Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useCalculator, formatCurrency } from "@/lib/calculator-store"
import { incrementFreeCalculations, hasExhaustedFreeCalculations } from "@/lib/free-calculations"
import { SaveProductModal } from "./save-product-modal"
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
  const [showSaveModal, setShowSaveModal] = useState(false)
  const prevNetProfitRef = useRef<number | null>(null)

  // Track when a new calculation occurs
  useEffect(() => {
    if (isAuthenticated) return // Don't track for authenticated users
    
    // Create a unique calculation signature from all input values
    const calculationSignature = JSON.stringify({
      itemName: state.itemName,
      unitCost: state.unitCost,
      quantity: state.quantity,
      unitSale: state.unitSale,
      weight: state.weight,
      airRate: state.airRate,
      seaRate: state.seaRate,
      adBudget: state.adBudget,
      shippingMethod: state.shippingMethod,
    })
    
    // Store the signature and compare on next render
    if (prevNetProfitRef.current !== calculationSignature && prevNetProfitRef.current !== null) {
      const updated = incrementFreeCalculations()
      console.log('[v0] Calculation tracked. Remaining:', 10 - updated)
      
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

    // Show the save modal to get product name
    setShowSaveModal(true)
  }

  const handleSaveSuccess = () => {
    // Show success indicator
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
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
    <>
      <SaveProductModal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSuccess={handleSaveSuccess}
      />
      <div className="lg:col-span-8 space-y-6">
      {/* Main KPI Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="text-xs font-black tracking-widest text-blue-400 uppercase mb-2">
                {state.itemName || "PRODUCT ANALYSIS"}
              </div>
              <h3 className="text-sm font-medium text-slate-400">
                Projected Net Profit
              </h3>
              <div
                className={`text-7xl font-extrabold tracking-tighter mt-2 ${
                  isNegativeProfit ? "text-red-400" : "text-white"
                }`}
              >
                KES {formatCurrency(results.netProfit)}
              </div>
            </div>
            <div
              className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider ${
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                Gross Sales
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(results.totalSales)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                Markup %
              </p>
              <p className="text-xl font-bold">{results.markup.toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                Shipping Total
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(results.totalShipping)}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">
                Unit B-Even
              </p>
              <p className="text-xl font-bold">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-between h-40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Inventory Load
          </p>
          <div>
            <p className="text-3xl font-extrabold text-slate-800">
              {formatCurrency(results.totalBuying)}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              Total purchasing cost
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-between h-40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Logistic Metrics
          </p>
          <div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Total Shipping</p>
                <p className="text-2xl font-extrabold text-slate-800">
                  {formatCurrency(results.totalShipping)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Per Unit ({state.shippingMethod})</p>
                <p className="text-lg font-bold text-slate-700">
                  {formatCurrency(results.unitShipCost)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.05)] rounded-[2rem] p-6 flex flex-col justify-between h-40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Load Volume
          </p>
          <div>
            <p className="text-3xl font-extrabold text-slate-800">
              {state.shippingMethod === "AIR"
                ? results.totalLoad.toFixed(2)
                : results.totalLoad.toFixed(4)}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              Total {state.shippingMethod === "AIR" ? "KG" : "CBM"}
            </p>
          </div>
        </div>
      </div>

      {/* Tips & Meta */}
      <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-blue-100">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Info className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-bold text-lg">Pro Profit Tip</h4>
          <p className="text-white/80 text-sm leading-relaxed">
            Aim for a minimum of <strong>30% margin</strong> to cover hidden
            operational costs like returns, broken items, and transaction fees.
          </p>
        </div>
      </div>

      {/* Native Ad Tile - Show to unauthenticated users */}
      <NativeAdTile 
        isVisible={!isAuthenticated}
        adUrl="https://www.shopify.com"
        adTitle="Scale Your Business"
        adDescription="Discover powerful e-commerce tools and resources that help you manage your store more efficiently and grow your sales."
      />
    </div>
    </>
  )
}
