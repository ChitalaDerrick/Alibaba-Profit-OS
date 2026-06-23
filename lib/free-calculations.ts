// Free tier calculation tracking
export const FREE_TIER_LIMIT = 10
const STORAGE_KEY = 'free_calculations_used'
const UPDATE_EVENT = 'freeCalculationsUpdated'

// A calculation is complete when user has entered shipping information
// For AIR: weight > 0
// For SEA: length > 0 && width > 0 && height > 0
export function isCalculationComplete(
  unitCost: number,
  unitSale: number,
  quantity: number,
  shippingMethod: "AIR" | "SEA",
  weight: number = 0,
  length: number = 0,
  width: number = 0,
  height: number = 0
): boolean {
  // Must have basic product info
  const hasBasicInfo = unitCost > 0 && unitSale > 0 && quantity > 0
  
  // Must have shipping info based on method
  const hasShippingInfo =
    (shippingMethod === "AIR" && weight > 0) ||
    (shippingMethod === "SEA" && length > 0 && width > 0 && height > 0)
  
  return hasBasicInfo && hasShippingInfo
}

// Custom event for notifying components of updates within the same tab
let updateListeners: (() => void)[] = []

export function onFreeCalculationsUpdate(callback: () => void) {
  updateListeners.push(callback)
  return () => {
    updateListeners = updateListeners.filter(cb => cb !== callback)
  }
}

function notifyUpdate() {
  updateListeners.forEach(cb => cb())
  // Also dispatch a storage event to handle cross-tab updates
  try {
    window.dispatchEvent(new Event('storage'))
  } catch (e) {
    // Ignore if storage event can't be dispatched
  }
}

export function getFreeCalculationsUsed(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? parseInt(stored) : 0
}

export function getFreeCalculationsRemaining(): number {
  return Math.max(0, FREE_TIER_LIMIT - getFreeCalculationsUsed())
}

export function incrementFreeCalculations(): number {
  if (typeof window === 'undefined') return 0
  
  const current = getFreeCalculationsUsed()
  const next = Math.min(current + 1, FREE_TIER_LIMIT)
  localStorage.setItem(STORAGE_KEY, next.toString())
  notifyUpdate()
  
  return next
}

export function resetFreeCalculations(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function hasExhaustedFreeCalculations(): boolean {
  return getFreeCalculationsUsed() >= FREE_TIER_LIMIT
}
