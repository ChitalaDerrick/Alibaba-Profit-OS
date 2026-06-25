"use client"

import useSWR from "swr"

export interface CalculatorState {
  itemName: string
  unitCost: number
  quantity: number
  unitSale: number
  weight: number
  airRate: number
  length: number
  width: number
  height: number
  seaRate: number
  adBudget: number
  exchangeRate: number
  shippingMethod: "AIR" | "SEA"
  isUsdMode: boolean
}

export interface CalculatedResults {
  costInKes: number
  unitShipCost: number
  totalLoad: number
  totalSales: number
  totalBuying: number
  totalShipping: number
  totalCost: number
  netProfit: number
  margin: number
  markup: number
  breakEven: number
}

const defaultState: CalculatorState = {
  itemName: "",
  unitCost: 0,
  quantity: 1,
  unitSale: 0,
  weight: 0.5,
  airRate: 1620,
  length: 10,
  width: 10,
  height: 10,
  seaRate: 60000,
  adBudget: 0,
  exchangeRate: 129.5,
  shippingMethod: "AIR",
  isUsdMode: false,
}

let globalState = { ...defaultState }

export function useCalculator() {
  const { data, mutate } = useSWR<CalculatorState>("calculator", () => globalState, {
    fallbackData: globalState,
    revalidateOnFocus: false,
  })

  const state = data ?? globalState

  const updateState = (updates: Partial<CalculatorState>) => {
    globalState = { ...globalState, ...updates }
    mutate(globalState, false)
  }

  const resetState = () => {
    globalState = {
      ...defaultState,
      quantity: 1,
      weight: 0.5,
      airRate: 1620,
      seaRate: 60000,
      exchangeRate: state.exchangeRate,
    }
    mutate(globalState, false)
  }

  const results = calculateResults(state)

  return {
    state,
    updateState,
    resetState,
    results,
  }
}

function calculateResults(state: CalculatorState): CalculatedResults {
  const {
    unitCost,
    quantity,
    unitSale,
    weight,
    airRate,
    length,
    width,
    height,
    seaRate,
    adBudget,
    exchangeRate,
    shippingMethod,
    isUsdMode,
  } = state

  let costInKes = unitCost
  if (isUsdMode) {
    costInKes = unitCost * exchangeRate
  }

  let unitShipCost = 0
  let totalLoad = 0
  let totalShippingAmount = 0

  if (shippingMethod === "AIR") {
    // AIR: per item weight × air rate × quantity
    unitShipCost = weight * airRate
    totalLoad = weight * quantity
    totalShippingAmount = unitShipCost * quantity
  } else {
    // SEA: Total consolidated volume (length × width × height) × sea rate
    // Quantity is IRRELEVANT - you pay for the total CBM, not per item
    const totalCbm = (length * width * height) / 1000000 // convert cm³ to m³
    totalShippingAmount = totalCbm * seaRate // FINAL shipping cost for the entire consolidated shipment
    unitShipCost = totalShippingAmount / quantity // just for display purposes
    totalLoad = totalCbm // total CBM volume
  }

  const totalSales = unitSale * quantity
  const totalBuying = costInKes * quantity
  const totalShipping = totalShippingAmount
  const totalCost = totalBuying + totalShipping + adBudget
  const netProfit = totalSales - totalCost

  const margin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0
  const markup =
    totalBuying + totalShipping > 0
      ? (netProfit / (totalBuying + totalShipping)) * 100
      : 0
  const breakEven = quantity > 0 ? totalCost / quantity : 0

  return {
    costInKes,
    unitShipCost,
    totalLoad,
    totalSales,
    totalBuying,
    totalShipping,
    totalCost,
    netProfit,
    margin,
    markup,
    breakEven,
  }
}

export function formatCurrency(num: number): string {
  return Math.round(num).toLocaleString()
}

export function formatCompactNumber(num: number): string {
  const absNum = Math.abs(num)
  
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M'
  } else if (absNum >= 1_000) {
    return (num / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K'
  }
  
  return Math.round(num).toLocaleString()
}
