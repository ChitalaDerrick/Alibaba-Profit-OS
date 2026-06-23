import { createClient } from '@/lib/supabase/server'
import { validateSavedProduct, updateProductSchema } from '@/lib/validation'
import { NextRequest, NextResponse } from 'next/server'

// GET all saved products for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('saved_products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, products: data })
  } catch (error) {
    console.error('[v0] Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST new saved product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateSavedProduct(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid product data', details: validation.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('saved_products')
      .insert({
        user_id: user.id,
        product_name: validation.data.productName,
        unit_cost: validation.data.unitCost,
        unit_sale: validation.data.unitSale,
        quantity: validation.data.quantity,
        profit_margin: parseFloat(validation.data.profitMargin as any),
        total_profit: validation.data.totalProfit,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, product: data }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error saving product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
