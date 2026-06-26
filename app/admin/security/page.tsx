'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Shield, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Threat {
  ip: string
  currentAttempts: number
  totalHistorical: number
  threatTypes: string[]
  timeUntilReset: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  blocked: boolean
}

interface SecurityIncident {
  id: string
  type: string
  ip: string
  path: string
  method: string
  userAgent?: string
  blocked: boolean
  createdAt: string
}

export default function SecurityDashboard() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ critical: 0, high: 0, medium: 0, low: 0 })
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const [threatsRes, incidentsRes] = await Promise.all([
        fetch('/api/admin/security/threats'),
        fetch('/api/admin/security/incidents?limit=50')
      ])

      if (threatsRes.ok) {
        const data = await threatsRes.json()
        setThreats(data.threats || [])
        setSummary(data.summary || {})
      }

      if (incidentsRes.ok) {
        const data = await incidentsRes.json()
        setIncidents(data.incidents || [])
      }
    } catch (error) {
      console.error('[v0] Error fetching security data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'high':
        return 'bg-orange-50 border-orange-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-slate-900" />
              <h1 className="text-3xl font-bold text-slate-900">Security Monitor</h1>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'} Data
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Critical Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{summary.critical}</div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{summary.high}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Medium Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{summary.medium}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Low Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary.low}</div>
            </CardContent>
          </Card>
        </div>

        {/* Blocked IPs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Blocked IP Addresses
            </CardTitle>
            <CardDescription>Real-time tracking of rate-limited and blocked IPs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading security data...</div>
            ) : threats.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No active threats detected</div>
            ) : (
              <div className="space-y-3">
                {threats.slice(0, 10).map((threat, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg ${getSeverityColor(threat.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <code className="font-mono text-sm font-bold text-slate-900">
                            {threat.ip}
                          </code>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityBadgeColor(threat.severity)}`}>
                            {threat.severity.toUpperCase()}
                          </span>
                          {threat.blocked && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-800">
                              BLOCKED
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-slate-600 space-y-1">
                          <p>Current attempts: <span className="font-bold">{threat.currentAttempts}</span></p>
                          <p>Total historical: <span className="font-bold">{threat.totalHistorical}</span></p>
                          {threat.threatTypes.length > 0 && (
                            <p>Attack types: <span className="font-bold">{threat.threatTypes.join(', ')}</span></p>
                          )}
                          {threat.timeUntilReset > 0 && (
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Unblocks in: <span className="font-bold">{Math.ceil(threat.timeUntilReset / 60)} minutes</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Recent Security Incidents
            </CardTitle>
            <CardDescription>Last 50 security events across your application</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading incidents...</div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No security incidents recorded</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-bold text-slate-900">Time</th>
                      <th className="text-left py-2 px-3 font-bold text-slate-900">Type</th>
                      <th className="text-left py-2 px-3 font-bold text-slate-900">IP Address</th>
                      <th className="text-left py-2 px-3 font-bold text-slate-900">Path</th>
                      <th className="text-left py-2 px-3 font-bold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(incident => (
                      <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 text-slate-600">
                          {new Date(incident.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-900">{incident.type}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{incident.ip || '—'}</td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600 truncate max-w-xs">
                          {incident.path}
                        </td>
                        <td className="py-3 px-3">
                          {incident.blocked ? (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-800">
                              BLOCKED
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                              LOGGED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
