import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from '@/lib/security-logger'
import { getClientIp, trackSuspiciousAttempt } from '@/lib/ip-rate-limit'

// List of suspicious paths that attackers commonly scan for
const SUSPICIOUS_PATHS = [
  '/wp-admin',
  '/wp-login.php',
  '/admin',
  '/phpmyadmin',
  '/xmlrpc.php',
  '/.env',
  '/.git',
  '/.aws',
  '/config.php',
  '/web.config',
  '/aws_credentials',
  '/.well-known/security.txt',
  '/backup',
  '/test',
  '/debug'
]



function hasSqlInjectionPattern(str: string): boolean {
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/i,
    /(--|;|\*|'|")/i
  ]

  return sqlPatterns.some(pattern => pattern.test(str))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const clientIp = getClientIp(request)

  // Check for suspicious paths
  const isSuspiciousPath = SUSPICIOUS_PATHS.some(path => 
    pathname.toLowerCase().includes(path.toLowerCase())
  )

  if (isSuspiciousPath) {
    // Track attempt from this IP
    const isBlocked = trackSuspiciousAttempt(clientIp)

    logSecurityEvent('suspicious_request', {
      details: {
        path: pathname,
        method: request.method,
        reason: 'suspicious_path_detected',
        ip: clientIp,
        blocked: isBlocked
      },
      request
    })
    
    // Return 429 if IP is blocked, otherwise 404
    if (isBlocked) {
      console.log(`[v0 Security] Blocking IP ${clientIp} - exceeded suspicious request threshold`)
      return new NextResponse('Too Many Requests', { status: 429 })
    }

    // Return 404 to prevent information disclosure
    return new NextResponse('Not Found', { status: 404 })
  }

  // Check for SQL injection patterns in query params
  const queryString = request.nextUrl.search
  if (queryString && hasSqlInjectionPattern(queryString)) {
    logSecurityEvent('suspicious_request', {
      details: {
        path: pathname,
        reason: 'sql_injection_pattern',
        queryLength: queryString.length
      },
      request
    })
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Update session for all requests (handles both auth and public routes)
  // Home page and auth routes are publicly accessible
  // updateSession will refresh user session if logged in, but won't block public access
  const response = await updateSession(request)

  // Ensure secure cookie flags are set
  // Note: Supabase auth already sets HTTPOnly and Secure flags
  // This ensures SameSite is set to Lax for CSRF protection
  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader) {
    const secureSetCookie = setCookieHeader
      .split(';')
      .map(part => part.trim())
      .filter(part => !part.toLowerCase().startsWith('samesite'))
      .join('; ') + '; SameSite=Lax'
    
    response.headers.set('set-cookie', secureSetCookie)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
