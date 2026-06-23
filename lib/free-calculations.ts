// Free tier calculation tracking
const FREE_TIER_LIMIT = 10
const STORAGE_KEY = 'free_calculations_used'

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
  
  return next
}

export function resetFreeCalculations(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function hasExhaustedFreeCalculations(): boolean {
  return getFreeCalculationsUsed() >= FREE_TIER_LIMIT
}
