import { createClient } from '@/lib/supabase/server'
import {
  initializePaystackPayment,
  getTokenPackageById,
  addTokensToUser,
} from '@/lib/paystack'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageId } = await request.json()

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Get token package details
    const tokenPackage = await getTokenPackageById(supabase, packageId)

    if (!tokenPackage) {
      return NextResponse.json(
        { error: 'Token package not found' },
        { status: 404 }
      )
    }

    // Initialize Paystack payment
    // Paystack expects amount in kobo: 1 KSH = 100 kobo
    const amountInKobo = Math.round(tokenPackage.price_kes * 100)

    const paystackResponse = await initializePaystackPayment(
      user.email!,
      amountInKobo,
      {
        user_id: user.id,
        token_package_id: packageId,
        token_amount: tokenPackage.token_amount,
        package_name: tokenPackage.name,
      }
    )

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    })
  } catch (error) {
    console.error('[v0] Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
