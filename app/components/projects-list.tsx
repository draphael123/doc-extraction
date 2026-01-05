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
    if (!name.trim()) {
      toast.error('Please enter a project name')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (res.ok) {
        const project = await res.json()
        toast.success('Project created successfully!', {
          description: `"${project.name}" is ready to use`,
        })
        setOpen(false)
        setName('')
        setDescription('')
        // Refresh projects list
        await fetchProjects()
        // Small delay before navigation for better UX
        setTimeout(() => {
          router.push(`/projects/${project.id}`)
        }, 300)
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create project', {
          description: 'Please try again or check your connection',
        })
        setCreating(false)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project', {
        description: 'Network error. Please check your connection and try again.',
      })
      setCreating(false)
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
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          Your Projects
        </h2>
        
        {/* Competitive Comparison Section */}
        <Card className="border-2 border-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              Why Choose Document Scrapper?
            </CardTitle>
            <CardDescription className="text-base text-gray-700">
              See how we compare to other document extraction platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border-2 border-green-300 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h3 className="font-bold text-green-700">Document Scrapper</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Unlimited</strong> document processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Custom templates</strong> with regex & AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Batch processing</strong> for thousands of files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>No per-document fees</strong> or hidden costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Full control</strong> over your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span><strong>Export to PDF & CSV</strong> included</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-red-200 shadow-md opacity-75">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <h3 className="font-bold text-red-600">Traditional OCR Tools</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Limited to <strong>hundreds</strong> of documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Fixed templates</strong> only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>One-by-one</strong> processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Per-document pricing</strong> adds up quickly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Data locked</strong> in their platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Export costs</strong> extra</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 shadow-md opacity-75">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <h3 className="font-bold text-yellow-600">Enterprise Solutions</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">✗</span>
                    <span>Requires <strong>enterprise contracts</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">✗</span>
                    <span><strong>Complex setup</strong> & IT integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">✗</span>
                    <span><strong>Weeks</strong> to deploy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">✗</span>
                    <span><strong>$10,000+</strong> annual licenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">✗</span>
                    <span><strong>Vendor lock-in</strong> & dependencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold">✗</span>
                    <span><strong>Limited customization</strong></span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-lg border-2 border-purple-300">
              <p className="text-center text-gray-800 font-semibold">
                <span className="text-purple-700">Document Scrapper</span> gives you enterprise-grade document extraction 
                <span className="text-pink-700"> without the enterprise price tag</span> or complexity. 
                <span className="text-orange-700"> Start processing thousands of documents today!</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-300"
            />
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-bold">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Project
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                Create a new project to organize your document extractions.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!creating && name.trim()) {
                  await createProject()
                }
              }}
            >
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Document Project"
                    required
                    autoFocus
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
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setOpen(false)
                    setName('')
                    setDescription('')
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={creating || !name.trim()}
                  onClick={async (e) => {
                    // Prevent double submission
                    if (creating) {
                      e.preventDefault()
                      return
                    }
                    // If button is disabled but clicked (shouldn't happen), handle it
                    if (!name.trim()) {
                      e.preventDefault()
                      toast.error('Please enter a project name')
                      return
                    }
                    // Let form submission handle it, but ensure it works
                    if (e.currentTarget.form) {
                      e.currentTarget.form.requestSubmit()
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
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
              'border-2 border-blue-400 bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-50 hover:from-blue-200 hover:via-cyan-200 hover:to-blue-100 shadow-lg hover:shadow-xl',
              'border-2 border-purple-400 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-50 hover:from-purple-200 hover:via-pink-200 hover:to-purple-100 shadow-lg hover:shadow-xl',
              'border-2 border-green-400 bg-gradient-to-br from-green-100 via-emerald-100 to-green-50 hover:from-green-200 hover:via-emerald-200 hover:to-green-100 shadow-lg hover:shadow-xl',
              'border-2 border-orange-400 bg-gradient-to-br from-orange-100 via-amber-100 to-orange-50 hover:from-orange-200 hover:via-amber-200 hover:to-orange-100 shadow-lg hover:shadow-xl',
              'border-2 border-indigo-400 bg-gradient-to-br from-indigo-100 via-violet-100 to-indigo-50 hover:from-indigo-200 hover:via-violet-200 hover:to-indigo-100 shadow-lg hover:shadow-xl',
              'border-2 border-teal-400 bg-gradient-to-br from-teal-100 via-cyan-100 to-teal-50 hover:from-teal-200 hover:via-cyan-200 hover:to-teal-100 shadow-lg hover:shadow-xl',
              'border-2 border-rose-400 bg-gradient-to-br from-rose-100 via-pink-100 to-rose-50 hover:from-rose-200 hover:via-pink-200 hover:to-rose-100 shadow-lg hover:shadow-xl',
            ]
            const colorClass = colors[index % colors.length]
            return (
              <Card
                key={project.id}
                className={`cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${colorClass}`}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-gray-900 font-bold text-lg">{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription className="text-gray-700">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      📄 {project._count?.documents || 0} documents
                    </span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      📋 {project._count?.templates || 0} templates
                    </span>
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
