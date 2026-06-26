"use client"

export async function exportReportAsCSV(projectId: string, projectName: string) {
  try {
    const response = await fetch('/api/export-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        format: 'csv',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate CSV')
    }

    const csv = await response.text()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${projectName}-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('[v0] Error exporting CSV:', error)
    throw error
  }
}

export async function exportReportAsPDF(projectId: string, projectName: string) {
  try {
    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = await import('html2pdf.js')
    
    const response = await fetch('/api/export-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        format: 'pdf',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    const data = await response.json()
    const element = document.createElement('div')
    element.innerHTML = data.html

    const opt = {
      margin: 10,
      filename: `report-${projectName}-${Date.now()}.pdf`,
      image: { type: 'png' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
    }

    html2pdf.default().set(opt).from(element).save()
  } catch (error) {
    console.error('[v0] Error exporting PDF:', error)
    throw error
  }
}
