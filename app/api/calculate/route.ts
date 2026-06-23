import { createClient } from '@/lib/supabase/server'
import { calculationSchema } from '@/lib/validation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Parse and validate request body
    const body = await request.json()
    const validation = calculationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    // If user is authenticated, check if they have active subscription
    if (user) {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('is_active, subscription_type, subscription_end_date')
        .eq('user_id', user.id)
        .single()

      if (subError || !subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        )
      }

      // Check if subscription is still active
      if (!subscription.is_active) {
        // Check if subscription has expired
        if (subscription.subscription_end_date && new Date(subscription.subscription_end_date) < new Date()) {
          return NextResponse.json(
            { error: 'Subscription expired', code: 'SUBSCRIPTION_EXPIRED' },
            { status: 402 }
          )
        }
      }

      // Log calculation for analytics
      const { error: logError } = await supabase
        .from('usage_logs')
        .insert([
          {
            user_id: user.id,
            calculation_type: 'profit_calculator',
            subscription_type: subscription.subscription_type,
          },
        ])

      if (logError) {
        console.error('[v0] Logging error:', logError)
        // Don't fail the request if logging fails
      }
    } else {
      // User is NOT authenticated - session-based tracking happens on client
      console.log('[v0] Free tier calculation completed')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Calculation completed',
        input: validation.data,
        isAuthenticated: !!user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Calculate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

