'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, CreditCard, Activity, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeSubscriptions: number
    paidUsers: number
    recurringUsers: number
    conversionRate: string
  }
  revenue: {
    daily: number
    weekly: number
    monthly: number
    annual: number
    total: number
    estimatedMRR: string
  }
  subscriptions: {
    daily: number
    weekly: number
    monthly: number
    annual: number
    free: number
  }
  recentActivity: {
    signupsLastWeek: number
    expiringInWeek: number
    churnedLastWeek: number
  }
  timestamp: string
}

interface User {
  id: string
  email: string
  createdAt: string
  subscriptionType: string
  isActive: boolean
  subscriptionEndDate: string | null
  autoRenew: boolean | null
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analyticsRes, usersRes] = await Promise.all([
          fetch('/api/admin/analytics'),
          fetch('/api/admin/users?limit=10'),
        ])

        if (!analyticsRes.ok || !usersRes.ok) {
          throw new Error('Unauthorized - Admin access required')
        }

        const analyticsData = await analyticsRes.json()
        const usersData = await usersRes.json()

        setAnalytics(analyticsData)
        setUsers(usersData.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!analytics) return null

  const revenueSources = [
    { name: 'Daily', value: analytics.revenue.daily },
    { name: 'Weekly', value: analytics.revenue.weekly },
    { name: 'Monthly', value: analytics.revenue.monthly },
    { name: 'Annual', value: analytics.revenue.annual },
  ]

  const subscriptionData = [
    { name: 'Daily', value: analytics.subscriptions.daily },
    { name: 'Weekly', value: analytics.subscriptions.weekly },
    { name: 'Monthly', value: analytics.subscriptions.monthly },
    { name: 'Annual', value: analytics.subscriptions.annual },
    { name: 'Free', value: analytics.subscriptions.free },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Real-time analytics and user management</p>
          </div>
          <Link href="/admin/security">
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
              <Shield className="w-4 h-4" />
              Security Monitor
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900">{analytics.overview.totalUsers}</p>
              <p className="text-xs text-slate-500 mt-1">All registered users</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Paid Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">{analytics.overview.paidUsers}</p>
              <p className="text-xs text-slate-500 mt-1">Conversion: {analytics.overview.conversionRate}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Subs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{analytics.overview.activeSubscriptions}</p>
              <p className="text-xs text-slate-500 mt-1">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Est. MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">KES {analytics.revenue.estimatedMRR}</p>
              <p className="text-xs text-slate-500 mt-1">Monthly recurring</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
                <CardDescription>Monthly revenue breakdown by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueSources}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `KES ${value}`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Daily</p>
                    <p className="text-xl font-bold text-slate-900">KES {analytics.revenue.daily}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Weekly</p>
                    <p className="text-xl font-bold text-slate-900">KES {analytics.revenue.weekly}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Monthly</p>
                    <p className="text-xl font-bold text-slate-900">KES {analytics.revenue.monthly}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Annual</p>
                    <p className="text-xl font-bold text-slate-900">KES {analytics.revenue.annual}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-600 font-medium">Total</p>
                    <p className="text-xl font-bold text-emerald-900">KES {analytics.revenue.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>Distribution of users across subscription tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subscriptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Subscription Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Daily</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.subscriptions.daily}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Weekly</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.subscriptions.weekly}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Monthly</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.subscriptions.monthly}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Annual</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.subscriptions.annual}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Free</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.subscriptions.free}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium mb-2">New Signups</p>
                    <p className="text-3xl font-bold text-green-900">{analytics.recentActivity.signupsLastWeek}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-amber-600 font-medium mb-2">Expiring Soon</p>
                    <p className="text-3xl font-bold text-amber-900">{analytics.recentActivity.expiringInWeek}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium mb-2">Churned</p>
                    <p className="text-3xl font-bold text-red-900">{analytics.recentActivity.churnedLastWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Users Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user signups and their subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Subscription</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.subscriptionType === 'free'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.subscriptionType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {user.subscriptionEndDate
                          ? new Date(user.subscriptionEndDate).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-sm text-slate-500 mt-8">
          Last updated: {new Date(analytics.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
