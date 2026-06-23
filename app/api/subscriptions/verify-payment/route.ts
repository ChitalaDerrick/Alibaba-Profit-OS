import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server not properly configured' },
        { status: 500 }
      )
    }

    const { reference } = await request.json()

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

    const { error: insertError } = await supabase
      .from('payments')
      .insert([
        {
          amount: paystackData.data.amount / 100, // Convert from kobo to KES
          currency: 'KES',
          status: 'success',
          gateway_reference: reference,
          metadata: {
            plan: paystackData.data.metadata?.plan,
            paystack_customer_id: paystackData.data.customer?.id,
            paid_at: paystackData.data.paid_at,
          },
        },
      ])

    if (insertError) {
      console.error('[v0] Failed to store payment record:', insertError)
    }

    return NextResponse.json({
      success: true,
      payment: {
        reference,
        amount: paystackData.data.amount / 100,
        plan: paystackData.data.metadata?.plan,
        email: paystackData.data.customer?.email,
        paidAt: paystackData.data.paid_at,
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
