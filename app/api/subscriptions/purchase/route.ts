import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const SUBSCRIPTION_PLANS = {
  daily: { price: 30, days: 1, recurring: false },
  weekly: { price: 180, days: 7, recurring: true },
  monthly: { price: 720, days: 30, recurring: true },
  annual: { price: 2880, days: 365, recurring: true }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Allow unauthenticated requests for free tier signup
    const body = await request.json()
    const { userId, type, skipPayment } = body
    
    // If skipPayment is true (free tier signup), use userId from body
    const targetUserId = skipPayment ? userId : user?.id

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Unauthorized or missing user ID' },
        { status: 401 }
      )
    }

    const planType = type || body.planType

    if (!planType || (!skipPayment && !Object.keys(SUBSCRIPTION_PLANS).includes(planType))) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    const plan = skipPayment ? { price: 0, days: 0, recurring: false } : SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]

    // Calculate subscription dates
    const now = new Date()
    const startDate = now
    const endDate = skipPayment ? null : new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000)

    // Only create history record if it's a paid subscription
    if (!skipPayment) {
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert([
          {
            user_id: targetUserId,
            subscription_type: planType,
            amount_paid: plan.price,
            currency: 'KES',
            payment_reference: body.paymentReference || `sub_${targetUserId}_${Date.now()}`,
            status: 'completed',
            started_at: startDate,
            expires_at: endDate,
          },
        ])

      if (historyError) {
        console.error('[v0] History creation error:', historyError)
        return NextResponse.json(
          { error: 'Failed to record subscription' },
          { status: 500 }
        )
      }
    }

    // Update or create subscription record
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', targetUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[v0] Subscription fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          subscription_type: skipPayment ? 'free' : planType,
          subscription_start_date: startDate,
          subscription_end_date: endDate,
          is_active: skipPayment ? false : true,
          auto_renew: skipPayment ? false : plan.recurring,
          updated_at: new Date(),
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        console.error('[v0] Subscription update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }
    } else {
      // Create new subscription
      const { error: createError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: targetUserId,
            subscription_type: skipPayment ? 'free' : planType,
            subscription_start_date: skipPayment ? null : startDate,
            subscription_end_date: skipPayment ? null : endDate,
            is_active: skipPayment ? false : true,
            auto_renew: skipPayment ? false : plan.recurring,
            free_calculations_used: 0,
          },
        ])

      if (createError) {
        console.error('[v0] Subscription create error:', createError)
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription activated',
        subscription: {
          type: planType,
          startDate,
          endDate,
          isActive: true,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
