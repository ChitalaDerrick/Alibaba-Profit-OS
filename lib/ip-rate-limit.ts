import { NextRequest } from 'next/server'

interface IpAttempt {
  count: number
  firstAttemptTime: number
  lastAttemptTime: number
}

// In-memory storage for IP tracking (resets on server restart)
const ipAttempts = new Map<string, IpAttempt>()

// Configuration
const SUSPICIOUS_ATTEMPTS_THRESHOLD = 5 // Block after 5 suspicious requests
const TIME_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds
const CLEANUP_INTERVAL = 60 * 60 * 1000 // Clean up old entries every hour

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, attempt] of ipAttempts.entries()) {
      if (now - attempt.lastAttemptTime > TIME_WINDOW) {
        ipAttempts.delete(ip)
      }
    }
  }, CLEANUP_INTERVAL)
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
  return ip
}

export function trackSuspiciousAttempt(ip: string): boolean {
  const now = Date.now()
  const attempt = ipAttempts.get(ip)

  if (!attempt) {
    // First attempt from this IP
    ipAttempts.set(ip, {
      count: 1,
      firstAttemptTime: now,
      lastAttemptTime: now
    })
    return false // Not blocked yet
  }

  // Check if still within time window
  if (now - attempt.firstAttemptTime > TIME_WINDOW) {
    // Time window expired, reset counter
    ipAttempts.set(ip, {
      count: 1,
      firstAttemptTime: now,
      lastAttemptTime: now
    })
    return false
  }

  // Increment counter
  attempt.count++
  attempt.lastAttemptTime = now

  // Block if threshold exceeded
  return attempt.count > SUSPICIOUS_ATTEMPTS_THRESHOLD
}

export function getIpAttemptCount(ip: string): number {
  const attempt = ipAttempts.get(ip)
  if (!attempt) return 0
  
  const now = Date.now()
  if (now - attempt.firstAttemptTime > TIME_WINDOW) {
    return 0 // Window expired
  }
  
  return attempt.count
}

export function getIpStatus(ip: string): { blocked: boolean; count: number; timeUntilReset: number } {
  const attempt = ipAttempts.get(ip)
  if (!attempt) {
    return { blocked: false, count: 0, timeUntilReset: 0 }
  }

  const now = Date.now()
  const timeElapsed = now - attempt.firstAttemptTime
  const isExpired = timeElapsed > TIME_WINDOW

  if (isExpired) {
    return { blocked: false, count: 0, timeUntilReset: 0 }
  }

  return {
    blocked: attempt.count > SUSPICIOUS_ATTEMPTS_THRESHOLD,
    count: attempt.count,
    timeUntilReset: TIME_WINDOW - timeElapsed
  }
}

export function getAllBlockedIps(): Array<{ ip: string; count: number; timeUntilReset: number }> {
  const blocked = []
  const now = Date.now()

  for (const [ip, attempt] of ipAttempts.entries()) {
    const timeElapsed = now - attempt.firstAttemptTime
    if (timeElapsed > TIME_WINDOW) continue

    if (attempt.count > SUSPICIOUS_ATTEMPTS_THRESHOLD) {
      blocked.push({
        ip,
        count: attempt.count,
        timeUntilReset: TIME_WINDOW - timeElapsed
      })
    }
  }

  return blocked.sort((a, b) => b.count - a.count)
}
