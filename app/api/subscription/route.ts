import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('token_balance, is_pro')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    // If no subscription, create default free tier with 10 starter tokens
    if (!subscription) {
      const { data: newSubscription } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          token_balance: 10,
          is_pro: false,
        })
        .select('token_balance, is_pro')
        .single()

      return NextResponse.json({
        success: true,
        tokenBalance: 10,
        remaining: 10,
      })
    }

    return NextResponse.json({
      success: true,
      tokenBalance: subscription.token_balance,
      remaining: subscription.token_balance,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
