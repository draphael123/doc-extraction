'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentsTab } from './documents-tab'
import { TemplatesTab } from './templates-tab'
import { ExtractionTab } from './extraction-tab'
import { ResultsTab } from './results-tab'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  description?: string | null
  documents: any[]
  templates: any[]
  jobs: any[]
}

export function ProjectDashboard({ project }: { project: Project }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('documents')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4 hover:bg-purple-100 text-purple-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600 text-lg">{project.description}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-2 border-purple-200">
          <TabsTrigger value="documents" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Documents</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Templates</TabsTrigger>
          <TabsTrigger value="extraction" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Extraction</TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          <DocumentsTab projectId={project.id} documents={project.documents} />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesTab projectId={project.id} templates={project.templates} />
        </TabsContent>

        <TabsContent value="extraction" className="mt-6">
          <ExtractionTab
            projectId={project.id}
            templates={project.templates}
            jobs={project.jobs}
          />
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <ResultsTab projectId={project.id} templates={project.templates} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
