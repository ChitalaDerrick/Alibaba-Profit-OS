'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  email: string
  createdAt: string
  subscriptionType: string
  isActive: boolean
  subscriptionEndDate: string | null
  autoRenew: boolean | null
}

interface UsersResponse {
  users: User[]
  pagination: {
    offset: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 20

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/admin/users?limit=${limit}&offset=${page * limit}`
        )

        if (!res.ok) {
          throw new Error('Unauthorized - Admin access required')
        }

        const data: UsersResponse = await res.json()
        setUsers(data.users)
        setTotal(data.pagination.total)
        setHasMore(data.pagination.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page])

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const getExpiryBadgeColor = (days: number | null) => {
    if (days === null) return 'text-slate-500'
    if (days < 0) return 'text-red-600'
    if (days < 3) return 'text-orange-600'
    if (days < 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading users...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">User Management</h1>
          <p className="text-slate-600">Manage all users and their subscriptions</p>
        </div>

        {/* Search and Stats */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Total: {total} users</CardDescription>
              </div>
              <div className="flex-1 max-w-md ml-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Subscription</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Signup Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Expires</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Auto Renew</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const daysLeft = getDaysUntilExpiry(user.subscriptionEndDate)
                      return (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-6 text-slate-900 font-medium">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              user.subscriptionType === 'free'
                                ? 'bg-slate-100 text-slate-700'
                                : user.subscriptionType === 'daily'
                                ? 'bg-amber-100 text-amber-700'
                                : user.subscriptionType === 'weekly'
                                ? 'bg-blue-100 text-blue-700'
                                : user.subscriptionType === 'monthly'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {user.subscriptionType}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              user.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className={`py-4 px-6 font-medium ${getExpiryBadgeColor(daysLeft)}`}>
                            {user.subscriptionEndDate ? (
                              <div>
                                <div>{formatDate(user.subscriptionEndDate)}</div>
                                {daysLeft !== null && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {daysLeft < 0
                                      ? `Expired ${Math.abs(daysLeft)} days ago`
                                      : daysLeft === 0
                                      ? 'Expires today'
                                      : `${daysLeft} days left`}
                                  </div>
                                )}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {user.autoRenew !== null && (
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                user.autoRenew
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {user.autoRenew ? 'Yes' : 'No'}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 px-6 text-center text-slate-500">
                        {search ? 'No users found matching your search' : 'No users available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Free Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {users.filter(u => u.subscriptionType === 'free').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Paid Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">
                {users.filter(u => u.subscriptionType !== 'free').length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => !u.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
