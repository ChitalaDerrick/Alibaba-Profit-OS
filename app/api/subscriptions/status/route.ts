import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
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
        { status: 200 }
      )
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('[v0] Subscription fetch error:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        {
          isActive: false,
          type: 'free',
          message: 'No active subscription',
        },
        { status: 200 }
      )
    }

    // Check if subscription has expired
    const now = new Date()
    const isExpired = subscription.subscription_end_date && new Date(subscription.subscription_end_date) < now

    const isActive = subscription.is_active && !isExpired

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
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
