import { createClient } from '@/lib/supabase/server'
import { getActiveTokenPackages } from '@/lib/paystack'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const packages = await getActiveTokenPackages(supabase)

    return NextResponse.json({
      success: true,
      packages,
    })
  } catch (error) {
    console.error('[v0] Packages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
