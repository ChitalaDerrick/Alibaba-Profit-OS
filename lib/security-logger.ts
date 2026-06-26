import { NextRequest } from 'next/server'

interface SecurityEvent {
  type: 'failed_login' | 'rate_limit_breach' | 'suspicious_request' | 'failed_payment' | 'unauthorized_access' | 'invalid_calculation'
  userId?: string
  ip?: string
  email?: string
  details?: Record<string, unknown>
  timestamp: Date
}

// In-memory event tracking for this instance
const eventLog: SecurityEvent[] = []
const MAX_LOG_SIZE = 1000

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwardedFor?.split(',')[0] || realIp || 'unknown'
}

export function logSecurityEvent(
  type: SecurityEvent['type'],
  options: {
    userId?: string
    email?: string
    request?: NextRequest
    details?: Record<string, unknown>
  } = {}
): void {
  const event: SecurityEvent = {
    type,
    userId: options.userId,
    email: options.email,
    ip: options.request ? getClientIp(options.request) : undefined,
    details: options.details,
    timestamp: new Date()
  }

  // Add to in-memory log
  eventLog.push(event)
  if (eventLog.length > MAX_LOG_SIZE) {
    eventLog.shift() // Remove oldest event
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[v0 Security]', JSON.stringify(event, null, 2))
  }

  // In production, you would send to external logging service (e.g., Sentry, LogRocket)
  // Example:
  // if (process.env.NODE_ENV === 'production') {
  //   captureMessage(`Security Event: ${type}`, 'warning', event)
  // }

  // Check for suspicious patterns
  checkSuspiciousPatterns(type)
}

function checkSuspiciousPatterns(type: SecurityEvent['type']): void {
  const recentEvents = eventLog.filter(
    e => e.timestamp.getTime() > Date.now() - 15 * 60 * 1000 // Last 15 minutes
  )

  // Alert on excessive failed logins
  const failedLogins = recentEvents.filter(e => e.type === 'failed_login')
  if (failedLogins.length >= 5) {
    console.warn('[v0 Security Alert] Multiple failed logins detected:', {
      count: failedLogins.length,
      ips: [...new Set(failedLogins.map(e => e.ip))],
      period: '15 minutes'
    })
  }

  // Alert on rate limit breaches
  const rateLimitBreaches = recentEvents.filter(e => e.type === 'rate_limit_breach')
  if (rateLimitBreaches.length >= 3) {
    console.warn('[v0 Security Alert] Rate limit breaches from same IP:', {
      count: rateLimitBreaches.length,
      ips: [...new Set(rateLimitBreaches.map(e => e.ip))]
    })
  }

  // Alert on repeated unauthorized access
  const unauthorizedAttempts = recentEvents.filter(e => e.type === 'unauthorized_access')
  if (unauthorizedAttempts.length >= 10) {
    console.warn('[v0 Security Alert] Multiple unauthorized access attempts:', {
      count: unauthorizedAttempts.length,
      ips: [...new Set(unauthorizedAttempts.map(e => e.ip))]
    })
  }

  // Alert on failed payments
  const failedPayments = recentEvents.filter(e => e.type === 'failed_payment')
  if (failedPayments.length >= 5) {
    console.warn('[v0 Security Alert] Multiple failed payment attempts:', {
      count: failedPayments.length,
      users: [...new Set(failedPayments.map(e => e.userId))]
    })
  }
}

export function getSecurityEventLog(type?: SecurityEvent['type']): SecurityEvent[] {
  if (type) {
    return eventLog.filter(e => e.type === type)
  }
  return eventLog
}

export function clearSecurityEventLog(): void {
  eventLog.length = 0
}
