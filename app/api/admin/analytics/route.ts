import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperUser } from '@/lib/super-user.server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperUser(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get total subscriptions count
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('subscription_type, is_active, created_at, subscription_end_date')

    // Calculate metrics
    const activeSubscriptions = subscriptions?.filter(s => s.is_active).length || 0
    const paidUsers = subscriptions?.filter(
      s => s.subscription_type && ['daily', 'weekly', 'monthly', 'annual'].includes(s.subscription_type)
    ).length || 0

    const recurringUsers = subscriptions?.filter(
      s => s.subscription_type && ['weekly', 'monthly', 'annual'].includes(s.subscription_type)
    ).length || 0

    const dailyUsers = subscriptions?.filter(
      s => s.subscription_type === 'daily'
    ).length || 0

    // Revenue calculation (rough estimate)
    const dailyRevenue = dailyUsers * 30
    const weeklyRevenue = subscriptions?.filter(s => s.subscription_type === 'weekly').length || 0 * 180
    const monthlyRevenue = subscriptions?.filter(s => s.subscription_type === 'monthly').length || 0 * 720
    const annualRevenue = subscriptions?.filter(s => s.subscription_type === 'annual').length || 0 * 2880

    const totalRevenue = dailyRevenue + weeklyRevenue + monthlyRevenue + annualRevenue

    // Subscription breakdown
    const subscriptionTypes = {
      daily: subscriptions?.filter(s => s.subscription_type === 'daily').length || 0,
      weekly: subscriptions?.filter(s => s.subscription_type === 'weekly').length || 0,
      monthly: subscriptions?.filter(s => s.subscription_type === 'monthly').length || 0,
      annual: subscriptions?.filter(s => s.subscription_type === 'annual').length || 0,
      free: (totalUsers || 0) - paidUsers,
    }

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentSignups } = await supabase
      .from('profiles')
      .select('created_at', { count: 'exact' })
      .gte('created_at', sevenDaysAgo)

    // Expiring soon (next 7 days)
    const today = new Date().toISOString()
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: expiringSoon } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true)
      .gte('subscription_end_date', today)
      .lte('subscription_end_date', sevenDaysFromNow)

    // Conversion rate
    const conversionRate = totalUsers ? (paidUsers / totalUsers * 100).toFixed(2) : '0.00'

    // Churn calculation (expired subscriptions in last 7 days)
    const { data: churned } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .eq('is_active', false)
      .gte('subscription_end_date', sevenDaysAgo)
      .lte('subscription_end_date', today)

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers || 0,
        activeSubscriptions,
        paidUsers,
        recurringUsers,
        conversionRate: `${conversionRate}%`,
      },
      revenue: {
        daily: dailyRevenue,
        weekly: weeklyRevenue,
        monthly: monthlyRevenue,
        annual: annualRevenue,
        total: totalRevenue,
        estimatedMRR: (monthlyRevenue + annualRevenue / 12).toFixed(0),
      },
      subscriptions: subscriptionTypes,
      recentActivity: {
        signupsLastWeek: recentSignups?.length || 0,
        expiringInWeek: expiringSoon?.length || 0,
        churnedLastWeek: churned?.length || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
