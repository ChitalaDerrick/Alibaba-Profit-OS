import { NextRequest, NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    if (!response.ok) {
      console.error('[v0] Paystack verification failed:', await response.text())
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    const data = await response.json()

    if (data.status && data.data.status === 'success') {
      return NextResponse.json(
        {
          success: true,
          message: 'Payment verified',
          amount: data.data.amount / 100,
          reference: data.data.reference,
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
