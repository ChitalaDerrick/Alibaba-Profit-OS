import { createClient } from '@/lib/supabase/server'
import { verifyPaystackPayment, addTokensToUser } from '@/lib/paystack'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const verification = await verifyPaystackPayment(reference)

    if (!verification.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    const { status, metadata, reference: ref } = verification.data

    if (status !== 'success') {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if already processed
    const { data: existingWebhook } = await supabase
      .from('paystack_webhooks')
      .select('*')
      .eq('reference', reference)
      .single()

    if (existingWebhook?.processed) {
      // Already processed, return success
      return NextResponse.redirect(
        new URL(
          `/tokens/success?reference=${reference}&tokens=${metadata.token_amount}`,
          request.url
        )
      )
    }

    // Add tokens to user
    try {
      await addTokensToUser(
        supabase,
        metadata.user_id,
        metadata.token_amount,
        'purchase',
        reference,
        `Purchased ${metadata.package_name}`
      )

      // Mark webhook as processed
      await supabase.from('paystack_webhooks').upsert(
        {
          reference,
          webhook_event: 'charge.success',
          status: 'success',
          amount: verification.data.amount / 100, // Convert from kobo to naira
          customer_email: metadata.user_id,
          processed: true,
          processed_at: new Date().toISOString(),
        },
        { onConflict: 'reference' }
      )

      // Redirect to success page
      return NextResponse.redirect(
        new URL(
          `/tokens/success?reference=${reference}&tokens=${metadata.token_amount}`,
          request.url
        )
      )
    } catch (tokenError) {
      console.error('[v0] Token addition error:', tokenError)

      // Log error in webhook
      await supabase.from('paystack_webhooks').upsert(
        {
          reference,
          webhook_event: 'charge.success',
          status: 'error',
          error_message: String(tokenError),
          processed: false,
        },
        { onConflict: 'reference' }
      )

      return NextResponse.redirect(
        new URL(`/tokens/error?reference=${reference}`, request.url)
      )
    }
  } catch (error) {
    console.error('[v0] Callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
