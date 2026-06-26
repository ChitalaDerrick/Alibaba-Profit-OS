// Rate limiting for login attempts
// 5 attempts per 15 minutes

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds
const MAX_ATTEMPTS = 5
const STORAGE_KEY = 'login-rate-limit'

interface RateLimitData {
  attempts: number
  firstAttemptTime: number
}

export function checkLoginRateLimit(): { allowed: boolean; attemptsRemaining: number; resetTime?: number } {
  if (typeof window === 'undefined') {
    // Server-side, always allow for now
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  const now = Date.now()

  if (!stored) {
    // No previous attempts
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS }
  }

  try {
    const data: RateLimitData = JSON.parse(stored)
    const timeSinceFirstAttempt = now - data.firstAttemptTime

    // Check if rate limit window has passed
    if (timeSinceFirstAttempt > RATE_LIMIT_WINDOW) {
      // Window has passed, reset
      localStorage.removeItem(STORAGE_KEY)
      return { allowed: true, attemptsRemaining: MAX_ATTEMPTS }
    }

    // Still in rate limit window
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - data.attempts)
    const resetTime = data.firstAttemptTime + RATE_LIMIT_WINDOW

    if (data.attempts >= MAX_ATTEMPTS) {
      return { allowed: false, attemptsRemaining, resetTime }
    }

    return { allowed: true, attemptsRemaining }
  } catch (error) {
    console.error('[v0] Error parsing rate limit data:', error)
    localStorage.removeItem(STORAGE_KEY)
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS }
  }
}

export function recordLoginAttempt(): void {
  if (typeof window === 'undefined') {
    return
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  const now = Date.now()

  if (!stored) {
    // First attempt
    const data: RateLimitData = {
      attempts: 1,
      firstAttemptTime: now,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    try {
      const data: RateLimitData = JSON.parse(stored)
      const timeSinceFirstAttempt = now - data.firstAttemptTime

      if (timeSinceFirstAttempt > RATE_LIMIT_WINDOW) {
        // Window has passed, reset
        const newData: RateLimitData = {
          attempts: 1,
          firstAttemptTime: now,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      } else {
        // Still in window, increment
        data.attempts++
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    } catch (error) {
      console.error('[v0] Error updating rate limit:', error)
    }
  }
}

export function formatResetTime(resetTime: number): string {
  const now = Date.now()
  const secondsRemaining = Math.ceil((resetTime - now) / 1000)
  
  if (secondsRemaining <= 0) {
    return 'now'
  }
  
  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  
  return `${seconds}s`
}
