import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Add no-cache headers to prevent stale subscription status
    const headers = {
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Return free tier for unauthenticated users
    if (!user) {
      return NextResponse.json(
        {
          isActive: false,
          type: 'free',
          daysRemaining: 0,
          message: 'Free tier - Sign in to upgrade',
        },
        { status: 200, headers }
      )
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('[v0] Subscription query result:', { userId: user.id, subscription, subError })

    if (subError && subError.code !== 'PGRST116') {
      console.error('[v0] Subscription fetch error:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500, headers }
      )
    }

    if (!subscription) {
      console.log('[v0] No subscription found for user:', user.id)
      return NextResponse.json(
        {
          isActive: false,
          type: 'free',
          message: 'No active subscription',
        },
        { status: 200, headers }
      )
    }

    // Check if subscription has expired
    const now = new Date()
    const endDate = subscription.subscription_end_date ? new Date(subscription.subscription_end_date) : null
    const isExpired = endDate ? endDate < now : false

    // Subscription is active if:
    // 1. It has a valid end date in the future (not expired)
    // 2. OR is_active flag is explicitly true
    const isActive = !isExpired || subscription.is_active === true

    console.log('[v0] Subscription active check:', { 
      endDate, 
      now, 
      isExpired, 
      is_active: subscription.is_active,
      isActive 
    })

    return NextResponse.json(
      {
        isActive,
        type: subscription.subscription_type,
        startDate: subscription.subscription_start_date,
        endDate: subscription.subscription_end_date,
        autoRenew: subscription.auto_renew,
        daysRemaining: isActive && subscription.subscription_end_date 
          ? Math.ceil((new Date(subscription.subscription_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      },
      { status: 200, headers }
    )
  } catch (error) {
    console.error('[v0] Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
