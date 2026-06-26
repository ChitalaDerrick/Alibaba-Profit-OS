import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logSecurityEvent } from '@/lib/security-logger'

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
      logSecurityEvent('failed_payment', {
        userId,
        details: {
          reference,
          paystackError: paystackData.message,
          reason: 'paystack_verification_failed'
        },
        request
      })
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
      logSecurityEvent('failed_payment', {
        userId,
        details: {
          reference,
          paystackStatus: paystackData.data.status,
          reason: 'payment_not_successful'
        },
        request
      })
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
      console.log('[v0] Activating subscription for user:', { userId, planType, plan })
      const now = new Date()
      const endDate = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000)

      // Check if subscription exists
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()

      console.log('[v0] Existing subscription check:', { existingSubscription, fetchError })

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[v0] Subscription fetch error:', fetchError)
      }

      if (existingSubscription) {
        // Fetch full subscription details to check if still active
        const { data: fullSubscription, error: fullFetchError } = await supabase
          .from('subscriptions')
          .select('subscription_end_date')
          .eq('id', existingSubscription.id)
          .single()

        let finalEndDate = endDate
        
        if (fullSubscription && fullSubscription.subscription_end_date) {
          const currentEndDate = new Date(fullSubscription.subscription_end_date)
          // If subscription hasn't expired yet, extend from current end date
          // This enables subscription stacking
          if (currentEndDate > now) {
            finalEndDate = new Date(currentEndDate.getTime() + plan.days * 24 * 60 * 60 * 1000)
            console.log('[v0] Subscription stacking enabled - extending from current end date', {
              currentEndDate: currentEndDate.toISOString(),
              newEndDate: finalEndDate.toISOString(),
              extensionDays: plan.days
            })
          } else {
            console.log('[v0] Subscription expired, resetting from today')
          }
        }

        // Update existing subscription
        console.log('[v0] Updating existing subscription:', existingSubscription.id)
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            subscription_type: planType,
            subscription_end_date: finalEndDate,
            is_active: true,
            auto_renew: planType !== 'daily',
            updated_at: new Date(),
          })
          .eq('id', existingSubscription.id)

        if (updateError) {
          console.error('[v0] Subscription update error:', updateError)
        } else {
          console.log('[v0] Subscription updated for user:', userId, { endDate: finalEndDate.toISOString() })
        }
      } else {
        // Create new subscription
        console.log('[v0] Creating new subscription for user:', userId)
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
    } else {
      console.log('[v0] No userId or plan for subscription activation:', { userId, planType })
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
