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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Fetch users with their subscription data
    const query = supabase
      .from('profiles')
      .select(
        `*,
        subscriptions(
          subscription_type,
          is_active,
          subscription_end_date,
          created_at,
          auto_renew
        )`
      )
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: users, error, count } = await query

    if (error) throw error

    // Format the response with subscription info
    const formattedUsers = users?.map(user => {
      const subscription = user.subscriptions?.[0]
      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        subscriptionType: subscription?.subscription_type || 'free',
        isActive: subscription?.is_active || false,
        subscriptionEndDate: subscription?.subscription_end_date,
        autoRenew: subscription?.auto_renew,
      }
    })

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        offset,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Users list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
