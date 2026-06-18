"use client"

import { useState, useEffect } from "react"
import { Download, FileText, BarChart3, Loader } from "lucide-react"
import { ProjectsManager } from "./projects-manager"
import { exportReportAsCSV, exportReportAsPDF } from "@/lib/export-utils"

export function ReportsTab() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | null>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        if (data.length > 0) {
          setSelectedProjectId(data[0].id)
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching projects:', error)
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!selectedProjectId) return

    setIsExporting(true)
    setExportFormat(format)

    try {
      if (format === 'pdf') {
        await exportReportAsPDF(selectedProjectId, selectedProject?.name || 'report')
      } else {
        await exportReportAsCSV(selectedProjectId, selectedProject?.name || 'report')
      }
    } catch (error) {
      console.error(`[v0] Error exporting ${format}:`, error)
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Projects Manager */}
      <div className="lg:col-span-1">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-4 sticky top-20">
          <ProjectsManager
            onProjectSelect={setSelectedProjectId}
            selectedProjectId={selectedProjectId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {!selectedProjectId ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Project Selected</h3>
            <p className="text-slate-500">Create a project from the left sidebar to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedProject?.name}</h2>
                  {selectedProject?.description && (
                    <p className="text-slate-600 mt-1">{selectedProject.description}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-2">
                    Created {new Date(selectedProject?.created_at).toLocaleDateString()}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Report</h3>
              <p className="text-slate-600 text-sm mb-6">
                Generate a professional report with your calculations, profit breakdown, and recommended business tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PDF Export */}
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors flex items-center justify-center mb-3">
                    {isExporting && exportFormat === 'pdf' ? (
                      <Loader className="w-6 h-6 text-red-600 animate-spin" />
                    ) : (
                      <Download className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-red-700">Export as PDF</p>
                  <p className="text-xs text-slate-500 mt-1">Professional report format</p>
                </button>

                {/* CSV Export */}
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-green-400 hover:bg-green-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors flex items-center justify-center mb-3">
                    {isExporting && exportFormat === 'csv' ? (
                      <Loader className="w-6 h-6 text-green-600 animate-spin" />
                    ) : (
                      <Download className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-green-700">Export as CSV</p>
                  <p className="text-xs text-slate-500 mt-1">Spreadsheet format</p>
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>Note:</strong> Your reports include recommended business tools and resources to help you optimize your e-commerce operations.
                </p>
              </div>
            </div>

            {/* Report Preview Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-slate-900 mb-1">Project Summary</p>
                  <p className="text-sm text-slate-600">Overview of your complete product search</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-1">Profit Analytics</p>
                  <p className="text-sm text-slate-600">Detailed breakdown of costs, revenue, and margins</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-1">Business Tools</p>
                  <p className="text-sm text-slate-600">Recommended partners to scale your business</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
