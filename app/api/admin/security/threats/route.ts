import { createClient } from '@/lib/supabase/server'
import { isSuperUser } from '@/lib/super-user.server'
import { getAllBlockedIps, getIpStatus } from '@/lib/ip-rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !(await isSuperUser(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get blocked IPs from rate limiting
    const blockedIps = getAllBlockedIps()

    // Get threat statistics from database
    const { data: stats, error: statsError } = await supabase
      .from('security_incidents')
      .select('ip_address, incident_type')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (statsError) {
      console.error('[v0] Error fetching threat stats:', statsError)
    }

    // Aggregate threat data by IP
    const threatMap = new Map<string, { types: string[]; count: number }>()

    stats?.forEach(incident => {
      if (!incident.ip_address) return
      
      const existing = threatMap.get(incident.ip_address)
      if (existing) {
        existing.count++
        if (!existing.types.includes(incident.incident_type)) {
          existing.types.push(incident.incident_type)
        }
      } else {
        threatMap.set(incident.ip_address, {
          types: [incident.incident_type],
          count: 1
        })
      }
    })

    // Combine with real-time blocking data
    const threats = blockedIps.map(blocked => {
      const historicalData = threatMap.get(blocked.ip) || { types: [], count: 0 }
      return {
        ip: blocked.ip,
        currentAttempts: blocked.count,
        totalHistorical: historicalData.count,
        threatTypes: historicalData.types,
        timeUntilReset: Math.ceil(blocked.timeUntilReset / 1000), // seconds
        severity: blocked.count > 10 ? 'critical' : blocked.count > 7 ? 'high' : 'medium',
        blocked: true
      }
    })

    // Add recent threats from historical data
    for (const [ip, data] of threatMap.entries()) {
      if (!blockedIps.some(b => b.ip === ip) && data.count >= 3) {
        threats.push({
          ip,
          currentAttempts: 0,
          totalHistorical: data.count,
          threatTypes: data.types,
          timeUntilReset: 0,
          severity: 'low',
          blocked: false
        })
      }
    }

    return NextResponse.json({
      threats: threats.sort((a, b) => b.totalHistorical - a.totalHistorical).slice(0, 50),
      totalBlockedIps: blockedIps.length,
      summary: {
        critical: threats.filter(t => t.severity === 'critical').length,
        high: threats.filter(t => t.severity === 'high').length,
        medium: threats.filter(t => t.severity === 'medium').length,
        low: threats.filter(t => t.severity === 'low').length
      }
    })
  } catch (error) {
    console.error('[v0] IP threats endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
