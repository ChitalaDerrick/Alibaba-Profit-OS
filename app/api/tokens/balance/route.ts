import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's token balance and transaction history
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('token_balance, lifetime_tokens_purchased')
      .eq('user_id', user.id)
      .single()

    if (subError) {
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      )
    }

    const { data: transactions, error: txError } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (txError) {
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      balance: subscription.token_balance,
      lifetime_purchased: subscription.lifetime_tokens_purchased,
      recent_transactions: transactions,
    })
  } catch (error) {
    console.error('[v0] Balance check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
