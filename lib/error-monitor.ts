interface ErrorEvent {
  type: 'not_found' | 'server_error' | 'slow_endpoint' | 'failed_payment' | 'failed_login' | 'validation_error'
  endpoint?: string
  statusCode?: number
  duration?: number // in milliseconds
  error?: string
  timestamp: Date
  count: number // Number of times this error has occurred
}

const errorLog: Map<string, ErrorEvent> = new Map()
const ALERT_THRESHOLD = {
  '404_spike': 10, // 10+ 404s in 5 minutes
  '500_spike': 5,  // 5+ 500s in 5 minutes
  'slow_endpoint': 3000, // 3+ seconds
  'failed_payments': 5, // 5+ failed payments in 15 minutes
}

export function trackError(
  type: ErrorEvent['type'],
  options: {
    endpoint?: string
    statusCode?: number
    duration?: number
    error?: string
  } = {}
): void {
  const key = `${type}:${options.endpoint || 'unknown'}`
  const existing = errorLog.get(key)

  const errorEvent: ErrorEvent = {
    type,
    endpoint: options.endpoint,
    statusCode: options.statusCode,
    duration: options.duration,
    error: options.error,
    timestamp: new Date(),
    count: (existing?.count || 0) + 1,
  }

  errorLog.set(key, errorEvent)

  // Check if we should alert
  checkAlertConditions(errorEvent, key)

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[v0 Error Monitor]', JSON.stringify(errorEvent, null, 2))
  }
}

function checkAlertConditions(errorEvent: ErrorEvent, key: string): void {
  // Count errors in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  
  const recentErrors = Array.from(errorLog.values()).filter(
    e => e.timestamp > fiveMinutesAgo && e.type === errorEvent.type
  )

  const errorCount = recentErrors.reduce((sum, e) => sum + e.count, 0)

  // Alert on 404 spike
  if (errorEvent.type === 'not_found' && errorCount >= ALERT_THRESHOLD['404_spike']) {
    console.warn('[v0 Alert] 404 spike detected:', {
      count: errorCount,
      endpoints: recentErrors.map(e => e.endpoint),
      period: '5 minutes'
    })
  }

  // Alert on 500 spike
  if (errorEvent.type === 'server_error' && errorCount >= ALERT_THRESHOLD['500_spike']) {
    console.warn('[v0 Alert] Server error spike detected:', {
      count: errorCount,
      endpoints: recentErrors.map(e => e.endpoint),
      errors: recentErrors.map(e => e.error),
      period: '5 minutes'
    })
  }

  // Alert on slow endpoints
  if (errorEvent.type === 'slow_endpoint' && errorEvent.duration && errorEvent.duration >= ALERT_THRESHOLD.slow_endpoint) {
    console.warn('[v0 Alert] Slow endpoint detected:', {
      endpoint: errorEvent.endpoint,
      duration: `${errorEvent.duration}ms`,
      threshold: `${ALERT_THRESHOLD.slow_endpoint}ms`
    })
  }

  // Alert on payment failures
  if (errorEvent.type === 'failed_payment' && errorCount >= ALERT_THRESHOLD.failed_payments) {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const paymentErrors = Array.from(errorLog.values()).filter(
      e => e.type === 'failed_payment' && e.timestamp > fifteenMinutesAgo
    )
    
    if (paymentErrors.length >= ALERT_THRESHOLD.failed_payments) {
      console.warn('[v0 Alert] Multiple payment failures detected:', {
        count: paymentErrors.length,
        period: '15 minutes'
      })
    }
  }
}

export function getErrorStats(): {
  total404s: number
  total500s: number
  slowEndpoints: ErrorEvent[]
  failedPayments: number
} {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const allErrors = Array.from(errorLog.values())

  const recentErrors = allErrors.filter(e => e.timestamp > fiveMinutesAgo)

  return {
    total404s: recentErrors.filter(e => e.type === 'not_found').reduce((sum, e) => sum + e.count, 0),
    total500s: recentErrors.filter(e => e.type === 'server_error').reduce((sum, e) => sum + e.count, 0),
    slowEndpoints: recentErrors.filter(e => e.type === 'slow_endpoint' && e.duration && e.duration >= ALERT_THRESHOLD.slow_endpoint),
    failedPayments: allErrors.filter(e => e.type === 'failed_payment').reduce((sum, e) => sum + e.count, 0),
  }
}

export function clearErrorLog(): void {
  errorLog.clear()
}
