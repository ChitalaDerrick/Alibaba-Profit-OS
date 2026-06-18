"use client"

import { useState, useEffect } from "react"
import { FolderPlus, Folder, Trash2, Edit2, X, Check } from "lucide-react"

interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  product_count?: number
}

interface ProjectsManagerProps {
  onProjectSelect: (projectId: string) => void
  selectedProjectId?: string
}

export function ProjectsManager({ onProjectSelect, selectedProjectId }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription || null,
        }),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects([...projects, newProject])
        setNewProjectName("")
        setNewProjectDescription("")
        setShowCreateForm(false)
        onProjectSelect(newProject.id)
      }
    } catch (error) {
      console.error('[v0] Error creating project:', error)
    }
  }

  const handleUpdateProject = async (projectId: string) => {
    if (!editingName.trim()) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      })

      if (response.ok) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, name: editingName } : p))
        setEditingId(null)
        setEditingName("")
      }
    } catch (error) {
      console.error('[v0] Error updating project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Delete this project and all its calculations?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
        if (selectedProjectId === projectId) {
          onProjectSelect(projects[0]?.id || "")
        }
      }
    } catch (error) {
      console.error('[v0] Error deleting project:', error)
    }
  }

  if (isLoading) {
    return <div className="text-slate-500">Loading projects...</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">My Projects</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
        >
          <FolderPlus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form onSubmit={handleCreateProject} className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
          <input
            type="text"
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Folder className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(project => (
            <div
              key={project.id}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedProjectId === project.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
              
              {editingId === project.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div className="flex-1 min-w-0" onClick={() => onProjectSelect(project.id)}>
                  <p className="font-medium text-slate-900 truncate">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-slate-500 truncate">{project.description}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
                {editingId === project.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateProject(project.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(project.id)
                        setEditingName(project.name)
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
