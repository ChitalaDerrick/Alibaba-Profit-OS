import { formatCurrency } from '@/lib/calculator-store'

export interface ReportProduct {
  product_name: string
  unit_cost: number
  unit_sale: number
  quantity: number
  total_cost: number
  total_sale: number
  total_profit: number
  profit_margin: number
  shipping_method: string
  shipping_cost_per_unit: number
  total_shipping: number
}

export interface ReportData {
  products: ReportProduct[]
  projectName: string
  generatedAt: Date
  affiliateLinks: Array<{
    name: string
    url: string
    description: string
  }>
}

// Affiliate links to embed in reports (customize these)
const AFFILIATE_LINKS = [
  {
    name: 'Shopify',
    url: 'https://www.shopify.com',
    description: 'Build your online store with Shopify',
  },
  {
    name: 'Stripe',
    url: 'https://stripe.com',
    description: 'Accept payments with Stripe',
  },
]

export function generateReportHTML(data: ReportData): string {
  const totalRevenue = data.products.reduce((sum, p) => sum + p.total_sale, 0)
  const totalCost = data.products.reduce((sum, p) => sum + p.total_cost, 0)
  const totalProfit = data.products.reduce((sum, p) => sum + p.total_profit, 0)
  const avgMargin =
    data.products.length > 0
      ? data.products.reduce((sum, p) => sum + p.profit_margin, 0) /
        data.products.length
      : 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Profit Analysis Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background: #f9fafb;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: white;
    }
    .header {
      border-bottom: 3px solid #0ea5e9;
      padding-bottom: 30px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #0ea5e9;
    }
    .summary-card h3 {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .summary-card.profit .value {
      color: #10b981;
    }
    .summary-card.margin .value {
      color: #8b5cf6;
    }
    .products-section {
      margin-bottom: 40px;
    }
    .products-section h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .positive {
      color: #10b981;
      font-weight: 600;
    }
    .negative {
      color: #ef4444;
      font-weight: 600;
    }
    .affiliate-section {
      background: #f0f9ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 25px;
      margin: 40px 0;
    }
    .affiliate-section h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #0c4a6e;
    }
    .affiliate-section p {
      color: #0369a1;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .affiliate-links {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .affiliate-link {
      background: white;
      border: 1px solid #e0e7ff;
      border-radius: 6px;
      padding: 15px;
    }
    .affiliate-link h3 {
      font-size: 14px;
      font-weight: 600;
      color: #0c4a6e;
      margin-bottom: 5px;
    }
    .affiliate-link p {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    .affiliate-link a {
      display: inline-block;
      padding: 6px 12px;
      background: #0ea5e9;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .page-break {
      page-break-after: always;
      margin: 40px 0;
    }
    @media print {
      body {
        background: white;
      }
      .container {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Profit Analysis Report</h1>
      <p>Project: ${data.projectName}</p>
      <p>Generated: ${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}</p>
    </div>

    <!-- Summary -->
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Revenue</h3>
        <div class="value">KES ${formatCurrency(totalRevenue)}</div>
      </div>
      <div class="summary-card">
        <h3>Total Cost</h3>
        <div class="value">KES ${formatCurrency(totalCost)}</div>
      </div>
      <div class="summary-card profit">
        <h3>Total Profit</h3>
        <div class="value">KES ${formatCurrency(totalProfit)}</div>
      </div>
      <div class="summary-card margin">
        <h3>Avg Margin</h3>
        <div class="value">${avgMargin.toFixed(1)}%</div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="products-section">
      <h2>Product Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th class="text-right">Unit Cost</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Revenue</th>
            <th class="text-right">Cost</th>
            <th class="text-right">Profit</th>
            <th class="text-right">Margin</th>
          </tr>
        </thead>
        <tbody>
          ${data.products
            .map(
              (product) => `
            <tr>
              <td>${product.product_name || 'Unnamed'}</td>
              <td class="text-right">KES ${formatCurrency(product.unit_cost)}</td>
              <td class="text-right">KES ${formatCurrency(product.unit_sale)}</td>
              <td class="text-right">${product.quantity}</td>
              <td class="text-right">KES ${formatCurrency(product.total_sale)}</td>
              <td class="text-right">KES ${formatCurrency(product.total_cost)}</td>
              <td class="text-right ${product.total_profit >= 0 ? 'positive' : 'negative'}">
                KES ${formatCurrency(product.total_profit)}
              </td>
              <td class="text-right ${product.profit_margin >= 0 ? 'positive' : 'negative'}">
                ${product.profit_margin.toFixed(1)}%
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Affiliate Section -->
    <div class="affiliate-section">
      <h2>Recommended Tools to Grow Your Business</h2>
      <p>Explore these recommended partners to optimize your e-commerce operations:</p>
      <div class="affiliate-links">
        ${data.affiliateLinks
          .map(
            (link) => `
          <div class="affiliate-link">
            <h3>${link.name}</h3>
            <p>${link.description}</p>
            <a href="${link.url}" target="_blank">Learn More →</a>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Generated by Profit Calculator | ${new Date().getFullYear()}</p>
      <p>Confidential - For business use only</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generateReportCSV(data: ReportData): string {
  const headers = [
    'Product Name',
    'Unit Cost',
    'Unit Sale',
    'Quantity',
    'Total Cost',
    'Total Sale',
    'Total Profit',
    'Profit Margin (%)',
    'Shipping Method',
    'Total Shipping',
  ]

  const rows = data.products.map((product) => [
    product.product_name || 'Unnamed',
    product.unit_cost,
    product.unit_sale,
    product.quantity,
    product.total_cost,
    product.total_sale,
    product.total_profit,
    product.profit_margin.toFixed(1),
    product.shipping_method,
    product.total_shipping,
  ])

  // Summary section
  const totalRevenue = data.products.reduce((sum, p) => sum + p.total_sale, 0)
  const totalCost = data.products.reduce((sum, p) => sum + p.total_cost, 0)
  const totalProfit = data.products.reduce((sum, p) => sum + p.total_profit, 0)
  const avgMargin =
    data.products.length > 0
      ? data.products.reduce((sum, p) => sum + p.profit_margin, 0) /
        data.products.length
      : 0

  const csv = [
    `Project: ${data.projectName}`,
    `Generated: ${data.generatedAt.toISOString()}`,
    '',
    'SUMMARY',
    `Total Revenue,${totalRevenue}`,
    `Total Cost,${totalCost}`,
    `Total Profit,${totalProfit}`,
    `Average Margin,${avgMargin.toFixed(1)}%`,
    '',
    'PRODUCT DETAILS',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    'AFFILIATE RECOMMENDATIONS',
    ...data.affiliateLinks.map((link) => `"${link.name}","${link.url}","${link.description}"`),
  ]

  return csv.join('\n')
}

export function getAffiliateLinks() {
  return AFFILIATE_LINKS
}
