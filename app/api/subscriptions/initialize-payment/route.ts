import { NextRequest, NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co'

export async function POST(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.error('[v0] PAYSTACK_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    const { plan, amount, email } = await request.json()

    if (!plan || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: plan and amount' },
        { status: 400 }
      )
    }

    // Use provided email or generate a temporary one for demo
    const paymentEmail = email || `user-${Date.now()}@pipos.app`

    // Get the base URL from the request
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    const callbackUrl = `${baseUrl}/checkout/callback`

    console.log('[v0] Initializing payment with:', { plan, amount, email: paymentEmail, callbackUrl })

    // Initialize Paystack payment
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: paymentEmail,
        amount, // amount in kobo
        metadata: {
          plan,
          type: 'subscription',
        },
        callback_url: callbackUrl,
      }),
    })

    const data = await response.json()

    console.log('[v0] Paystack response:', { status: response.status, data })

    if (!response.ok || !data.status) {
      console.error('[v0] Paystack initialization failed:', data)
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed', details: data },
        { status: 400 }
      )
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error('[v0] Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
