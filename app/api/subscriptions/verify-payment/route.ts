import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const SUBSCRIPTION_PLANS = {
  daily: { days: 1 },
  weekly: { days: 7 },
  monthly: { days: 30 },
  annual: { days: 365 }
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server not properly configured' },
        { status: 500 }
      )
    }

    const { reference, userId } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: 'No payment reference provided' },
        { status: 400 }
      )
    }

    // Verify with Paystack
    const paystackResponse = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('[v0] Paystack verification failed:', paystackData)
      return NextResponse.json(
        { 
          success: false,
          error: paystackData.message || 'Payment verification failed' 
        },
        { status: 400 }
      )
    }

    // Check if payment was successful
    if (paystackData.data.status !== 'success') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment was not completed successfully' 
        },
        { status: 400 }
      )
    }

    // Store payment record in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const planType = paystackData.data.metadata?.plan
    const plan = planType && planType in SUBSCRIPTION_PLANS 
      ? SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]
      : null

    const { error: insertError } = await supabase
      .from('payments')
      .insert([
        {
          amount: paystackData.data.amount / 100, // Convert from kobo to KES
          currency: 'KES',
          status: 'success',
          gateway_reference: reference,
          user_id: userId, // Link payment to user if authenticated
          metadata: {
            plan: planType,
            paystack_customer_id: paystackData.data.customer?.id,
            paid_at: paystackData.data.paid_at,
          },
        },
      ])

    if (insertError) {
      console.error('[v0] Failed to store payment record:', insertError)
    }

    // If user is authenticated, activate subscription immediately
    if (userId && plan) {
      const now = new Date()
      const endDate = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000)

      // Check if subscription exists
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[v0] Subscription fetch error:', fetchError)
      }

      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            subscription_type: planType,
            subscription_start_date: now,
            subscription_end_date: endDate,
            is_active: true,
            auto_renew: planType !== 'daily',
            updated_at: new Date(),
          })
          .eq('id', existingSubscription.id)

        if (updateError) {
          console.error('[v0] Subscription update error:', updateError)
        } else {
          console.log('[v0] Subscription activated for user:', userId)
        }
      } else {
        // Create new subscription
        const { error: createError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: userId,
              subscription_type: planType,
              subscription_start_date: now,
              subscription_end_date: endDate,
              is_active: true,
              auto_renew: planType !== 'daily',
              free_calculations_used: 0,
            },
          ])

        if (createError) {
          console.error('[v0] Subscription create error:', createError)
        } else {
          console.log('[v0] Subscription created for user:', userId)
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        reference,
        amount: paystackData.data.amount / 100,
        plan: planType,
        email: paystackData.data.customer?.email,
        paidAt: paystackData.data.paid_at,
        subscriptionActivated: !!userId && !!plan,
      },
    })
  } catch (error) {
    console.error('[v0] Payment verification error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
