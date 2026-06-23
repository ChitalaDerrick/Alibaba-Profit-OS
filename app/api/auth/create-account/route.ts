import { createClient as createServerClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, paymentReference } = await request.json()

    if (!email || !password || !paymentReference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client for user creation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[v0] Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createServerClient(supabaseUrl, serviceRoleKey)

    // Sign up the user with admin API
    console.log('[v0] Creating account for email:', email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since they've paid
    })

    if (authError) {
      console.error('[v0] Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user?.id) {
      console.error('[v0] No user ID returned')
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    console.log('[v0] User created with ID:', authData.user.id)

    // Verify the payment and create subscription
    console.log('[v0] Verifying payment reference:', paymentReference)
    
    let paymentData: any = null

    // Check for test reference (for development/testing)
    if (paymentReference.startsWith('test-ref-')) {
      console.log('[v0] Using test payment reference')
      paymentData = {
        status: true,
        data: {
          status: 'success',
          metadata: { plan: 'monthly' },
        },
      }
    } else {
      // Verify with Paystack
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      )

      paymentData = await verifyResponse.json()

      if (!paymentData.status || paymentData.data.status !== 'success') {
        console.error('[v0] Payment verification failed:', paymentData)
        // Delete the user if payment is invalid
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: 'Payment verification failed. Please check your payment status.' },
          { status: 400 }
        )
      }
    }

    console.log('[v0] Payment verified:', paymentData.data)

    // Get payment plan from metadata
    const planType = paymentData.data.metadata?.plan || 'monthly'
    const planMap: Record<string, string> = {
      daily: 'daily',
      monthly: 'monthly',
      yearly: 'annual',
    }
    const subscriptionType = planMap[planType] || 'monthly'

    // Get plan ID from database
    console.log('[v0] Looking up plan for type:', subscriptionType)
    const billCycle = subscriptionType === 'annual' ? 'annual' : subscriptionType === 'daily' ? 'daily' : 'monthly'
    const { data: planData, error: planError } = await supabase
      .from('paystack_plans')
      .select('id')
      .eq('billing_cycle', billCycle)
      .single()

    if (planError) {
      console.warn('[v0] Plan lookup error (this is OK, we can proceed without it):', planError)
      // Don't fail if plan lookup fails - user can still be created
    } else {
      console.log('[v0] Found plan:', planData)
    }

    // Create subscription record
    console.log('[v0] Creating subscription for user:', authData.user.id)
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: authData.user.id,
        subscription_type: subscriptionType,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: calculateEndDate(subscriptionType),
        is_active: true,
        plan_id: planData?.id || null,
      })

    if (subError) {
      console.error('[v0] Subscription creation error:', subError)
      // Don't fail - subscription can be created later
    }

    console.log('[v0] Account created successfully')
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      userId: authData.user.id,
    })
  } catch (error) {
    console.error('[v0] Account creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

function calculateEndDate(type: string): string {
  const now = new Date()
  let endDate = new Date(now)

  if (type === 'daily') {
    endDate.setDate(endDate.getDate() + 1)
  } else if (type === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else if (type === 'annual') {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }

  return endDate.toISOString()
}
