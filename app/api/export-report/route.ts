import { createClient } from '@/lib/supabase/server'
import { generateReportHTML, generateReportCSV, getAffiliateLinks, ReportData } from '@/lib/report-builder'
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

    const body = await request.json()
    const { projectId, format } = body // format: 'pdf' or 'csv'

    if (!projectId || !format) {
      return NextResponse.json(
        { error: 'projectId and format are required' },
        { status: 400 }
      )
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch saved products in this project
    const { data: products, error: productsError } = await supabase
      .from('saved_products')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (productsError) {
      throw productsError
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No products in this project' },
        { status: 400 }
      )
    }

    // Prepare report data
    const reportData: ReportData = {
      projectName: project.name,
      generatedAt: new Date(),
      affiliateLinks: getAffiliateLinks(),
      products: products.map((p) => ({
        product_name: p.product_name,
        unit_cost: p.unit_cost,
        unit_sale: p.unit_sale,
        quantity: p.quantity,
        total_cost: p.total_cost,
        total_sale: p.total_sale,
        total_profit: p.total_profit,
        profit_margin: p.profit_margin,
        shipping_method: p.shipping_method || 'N/A',
        shipping_cost_per_unit: p.shipping_cost_per_unit || 0,
        total_shipping: p.total_shipping || 0,
      })),
    }

    // Generate report
    if (format === 'csv') {
      const csv = generateReportCSV(reportData)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${project.name}-${Date.now()}.csv"`,
        },
      })
    } else if (format === 'pdf') {
      const html = generateReportHTML(reportData)
      return NextResponse.json({
        html,
        projectName: project.name,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "csv"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
