import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DEBUG ENDPOINT - Shows subscription details for logged-in user
 * Visit: /api/debug/subscription
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('[v0-debug] Checking subscription for user:', user.id)

    // Get subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('[v0-debug] Subscription query:', { subscription, subError })

    // Get payment records
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('[v0-debug] Payment query:', { payments, payError })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      subscription: subscription || null,
      payments: payments || [],
      subscriptionError: subError,
      paymentsError: payError,
    })
  } catch (error) {
    console.error('[v0-debug] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
