import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
const PAYSTACK_API_URL = 'https://api.paystack.co'

if (!PAYSTACK_SECRET_KEY) {
  console.error('[v0] PAYSTACK_SECRET_KEY is not set')
}

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    reference: string
    amount: number
    paid_at: string
    paidAt: string
    transaction_date: string
    status: 'success' | 'failed' | 'pending'
    customer: {
      id: number
      email: string
    }
    metadata: {
      user_id: string
      token_package_id: string
      token_amount: number
    }
  }
}

/**
 * Initialize a Paystack payment
 */
export async function initializePaystackPayment(
  email: string,
  amount: number,
  metadata: Record<string, any>
): Promise<PaystackInitializeResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not set')
  }

  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify({
      email,
      amount, // amount in kobo (1 KSH = 100 kobo)
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tokens/callback`,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.status) {
    console.error('[v0] Paystack initialization failed:', data)
    throw new Error(data.message || `Paystack initialization failed: ${response.statusText}`)
  }

  return data
}

/**
 * Verify a Paystack payment
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not set')
  }

  const response = await fetch(
    `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  if (!response.ok || !data.status) {
    console.error('[v0] Paystack verification failed:', data)
    throw new Error(data.message || `Paystack verification failed: ${response.statusText}`)
  }

  return data
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhookSignature(
  signature: string,
  body: string
): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('[v0] PAYSTACK_SECRET_KEY not set')
    return false
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex')

  return hash === signature
}

/**
 * Get token package by ID
 */
export async function getTokenPackageById(supabase: any, packageId: string) {
  const { data, error } = await supabase
    .from('token_packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all active token packages
 */
export async function getActiveTokenPackages(supabase: any) {
  const { data, error } = await supabase
    .from('token_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Add tokens to user balance
 */
export async function addTokensToUser(
  supabase: any,
  userId: string,
  tokenAmount: number,
  transactionType: 'purchase' | 'calculation' | 'refund' | 'admin_grant',
  paystackReference?: string,
  description?: string
) {
  // Get current subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('token_balance')
    .eq('user_id', userId)
    .single()

  if (subError) throw subError

  const previousBalance = subscription.token_balance
  const newBalance = previousBalance + tokenAmount

  // Update subscription balance
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      token_balance: newBalance,
      lifetime_tokens_purchased:
        transactionType === 'purchase'
          ? subscription.lifetime_tokens_purchased + tokenAmount
          : subscription.lifetime_tokens_purchased,
      last_token_purchase_date:
        transactionType === 'purchase' ? new Date().toISOString() : undefined,
    })
    .eq('user_id', userId)

  if (updateError) throw updateError

  // Log transaction
  const { error: txError } = await supabase
    .from('token_transactions')
    .insert([
      {
        user_id: userId,
        transaction_type: transactionType,
        token_amount: tokenAmount,
        previous_balance: previousBalance,
        new_balance: newBalance,
        paystack_reference: paystackReference,
        description: description,
      },
    ])

  if (txError) throw txError

  return { previousBalance, newBalance }
}

/**
 * Deduct tokens from user balance
 */
export async function deductTokensFromUser(
  supabase: any,
  userId: string,
  tokenAmount: number,
  description?: string
) {
  // Get current subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('token_balance')
    .eq('user_id', userId)
    .single()

  if (subError) throw subError

  const previousBalance = subscription.token_balance

  if (previousBalance < tokenAmount) {
    throw new Error('Insufficient tokens')
  }

  const newBalance = previousBalance - tokenAmount

  // Update subscription balance
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ token_balance: newBalance })
    .eq('user_id', userId)

  if (updateError) throw updateError

  // Log transaction
  const { error: txError } = await supabase
    .from('token_transactions')
    .insert([
      {
        user_id: userId,
        transaction_type: 'calculation',
        token_amount: -tokenAmount,
        previous_balance: previousBalance,
        new_balance: newBalance,
        description: description || 'Calculation performed',
      },
    ])

  if (txError) throw txError

  return { previousBalance, newBalance }
}

/**
 * Get user token balance
 */
export async function getUserTokenBalance(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('token_balance')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data.token_balance
}
