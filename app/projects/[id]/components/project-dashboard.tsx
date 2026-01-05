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
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="extraction">Extraction</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
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
