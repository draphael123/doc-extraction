'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, FolderOpen, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  _count?: {
    documents: number
    templates: number
  }
}

export function ProjectsList() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects(projects)
    }
  }, [searchQuery, projects])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        setFilteredProjects(data)
      } else {
        toast.error('Failed to load projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {
    if (!name.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (res.ok) {
        const project = await res.json()
        toast.success('Project created successfully!')
        router.push(`/projects/${project.id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
      setOpen(false)
      setName('')
      setDescription('')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Your Projects</h2>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize your document extractions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Document Project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createProject} disabled={creating || !name.trim()}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filteredProjects.length === 0 && projects.length > 0 ? (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-blue-600 mb-4" />
            <p className="text-blue-700 mb-4 font-medium">No projects match your search</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-purple-600 mb-4" />
            <p className="text-purple-700 mb-4 font-medium">No projects yet</p>
            <Button onClick={() => setOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => {
            const colors = [
              'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100',
              'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100',
              'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100',
              'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100',
              'border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100',
              'border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100',
            ]
            const colorClass = colors[index % colors.length]
            return (
              <Card
                key={project.id}
                className={`cursor-pointer hover:shadow-xl transition-all border-2 ${colorClass}`}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-gray-800">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="text-gray-600">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-blue-600">{project._count?.documents || 0} documents</span>
                    <span className="font-semibold text-purple-600">{project._count?.templates || 0} templates</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
