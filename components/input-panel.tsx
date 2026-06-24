"use client"

import { useCalculator } from "@/lib/calculator-store"

function InputPill({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border-[1.5px] border-slate-150 shadow-sm transition-all focus-within:border-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] ${className}`}
    >
      {children}
    </div>
  )
}

function SectionCard({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white text-[11px] font-black rounded-full">
          {number}
        </span>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

export function InputPanel({ onCalculate }: { onCalculate?: () => void }) {
  const { state, updateState, results } = useCalculator()

  const handleCalculate = () => {
    onCalculate?.()
  }

  return (
    <div className="lg:col-span-4 space-y-5 sm:space-y-6">
      {/* 01 Product Info */}
      <SectionCard number="01" title="Inventory Specs">
        <div className="space-y-5">
          <InputPill>
            <label className="block text-[11px] sm:text-[10px] font-black text-slate-500 uppercase mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={state.itemName}
              onChange={(e) => updateState({ itemName: e.target.value })}
              placeholder="What are you importing?"
              className="w-full bg-transparent font-bold text-slate-800 outline-none placeholder:text-slate-300"
            />
          </InputPill>

          <div className="grid grid-cols-2 gap-4">
            <InputPill>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                {state.isUsdMode ? "Buying Price (USD)" : "Cost (KES)"}
              </label>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <span className="text-slate-400">
                  {state.isUsdMode ? "$" : "K"}
                </span>
                <input
                  type="number"
                  value={state.unitCost || ""}
                  onChange={(e) =>
                    updateState({ unitCost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </InputPill>
            <InputPill>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={state.quantity || ""}
                onChange={(e) =>
                  updateState({ quantity: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
              />
            </InputPill>
          </div>

          {/* Live USD Engine */}
          {state.isUsdMode && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                    Exchange Engine
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full">
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-800">
                    1 USD =
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={state.exchangeRate}
                      onChange={(e) =>
                        updateState({
                          exchangeRate: parseFloat(e.target.value) || 1,
                        })
                      }
                      className="w-20 bg-white border border-orange-200 rounded-lg py-1 px-2 text-right font-black text-orange-600 text-sm outline-none"
                    />
                    <span className="text-[10px] font-bold text-orange-800">
                      KES
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-medium text-orange-500/80 italic">
                  KES {results.costInKes.toFixed(2)} Per Unit
                </div>
              </div>
            </div>
          )}

          <InputPill>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
              Target Retail (KES)
            </label>
            <input
              type="number"
              value={state.unitSale || ""}
              onChange={(e) =>
                updateState({ unitSale: parseFloat(e.target.value) || 0 })
              }
              placeholder="Expected selling price"
              className="w-full bg-transparent font-bold text-slate-800 outline-none placeholder:text-slate-300"
            />
          </InputPill>
        </div>
      </SectionCard>

      {/* 02 Logistics */}
      <SectionCard number="02" title="Logistics">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => updateState({ shippingMethod: "AIR" })}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              state.shippingMethod === "AIR"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            AIR FREIGHT
          </button>
          <button
            onClick={() => updateState({ shippingMethod: "SEA" })}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              state.shippingMethod === "SEA"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            SEA CARGO
          </button>
        </div>

        {state.shippingMethod === "AIR" ? (
          <div className="space-y-4">
            <InputPill>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                Weight Per Unit (KG)
              </label>
              <input
                type="number"
                step="0.01"
                value={state.weight || ""}
                onChange={(e) =>
                  updateState({ weight: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
              />
            </InputPill>
            <InputPill>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                Air Rate (KES/KG)
              </label>
              <input
                type="number"
                value={state.airRate || ""}
                onChange={(e) =>
                  updateState({ airRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
              />
            </InputPill>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <InputPill className="p-2 text-center">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                  L(cm)
                </label>
                <input
                  type="number"
                  value={state.length || ""}
                  onChange={(e) =>
                    updateState({ length: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-transparent font-bold text-center text-sm outline-none"
                />
              </InputPill>
              <InputPill className="p-2 text-center">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                  W(cm)
                </label>
                <input
                  type="number"
                  value={state.width || ""}
                  onChange={(e) =>
                    updateState({ width: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-transparent font-bold text-center text-sm outline-none"
                />
              </InputPill>
              <InputPill className="p-2 text-center">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                  H(cm)
                </label>
                <input
                  type="number"
                  value={state.height || ""}
                  onChange={(e) =>
                    updateState({ height: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-transparent font-bold text-center text-sm outline-none"
                />
              </InputPill>
            </div>
            <InputPill>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                Sea Rate (KES/CBM)
              </label>
              <input
                type="number"
                value={state.seaRate || ""}
                onChange={(e) =>
                  updateState({ seaRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-bold text-slate-800 outline-none"
              />
            </InputPill>
          </div>
        )}
      </SectionCard>

      {/* 03 Overhead */}
      <SectionCard number="03" title="Marketing & Ops">
        <InputPill>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
            Total Ad/Op Budget (KES)
          </label>
          <input
            type="number"
            value={state.adBudget || ""}
            onChange={(e) =>
              updateState({ adBudget: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            className="w-full bg-transparent font-bold text-slate-800 outline-none"
          />
        </InputPill>
      </SectionCard>
    </div>
  )
}
