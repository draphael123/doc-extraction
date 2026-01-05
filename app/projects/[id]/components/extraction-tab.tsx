'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
}

interface Job {
  id: string
  status: string
  progress: number
  totalDocs: number
  processedDocs: number
  failedDocs: number
  createdAt: string
  completedAt?: string
}

export function ExtractionTab({
  projectId,
  templates,
  jobs: initialJobs,
}: {
  projectId: string
  templates: Template[]
  jobs: Job[]
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [jobs, setJobs] = useState(initialJobs)
  const [running, setRunning] = useState(false)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    // Poll for job updates if there are running jobs
    const runningJobs = jobs.filter((j) => j.status === 'RUNNING')
    if (runningJobs.length > 0 && !polling) {
      setPolling(true)
      const interval = setInterval(async () => {
        try {
          for (const job of runningJobs) {
            const res = await fetch(`/api/jobs/${job.id}`)
            if (res.ok) {
              const updated = await res.json()
              setJobs((prev) =>
                prev.map((j) => (j.id === updated.id ? updated : j))
              )
            }
          }
        } catch (error) {
          console.error('Error polling jobs:', error)
        }
      }, 2000) // Poll every 2 seconds

      return () => {
        clearInterval(interval)
        setPolling(false)
      }
    }
  }, [jobs, polling])

  async function startExtraction() {
    if (!selectedTemplate) {
      toast.error('Please select a template')
      return
    }

    setRunning(true)
    try {
      const res = await fetch('/api/extract/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          templateId: selectedTemplate,
        }),
      })

      if (res.ok) {
        const job = await res.json()
        setJobs((prev) => [job, ...prev])
        setSelectedTemplate('')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to start extraction')
      }
    } catch (error) {
      console.error('Error starting extraction:', error)
      toast.error('Failed to start extraction')
    } finally {
      setRunning(false)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'RUNNING':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Start Extraction</CardTitle>
          <CardDescription>
            Select a template and start extracting data from documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Extraction Template</Label>
            <select
              id="template"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Select a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={startExtraction}
            disabled={running || !selectedTemplate || templates.length === 0}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          >
            <Play className="mr-2 h-4 w-4" />
            {running ? 'Starting...' : 'Start Extraction'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extraction Jobs</CardTitle>
          <CardDescription>Recent extraction jobs and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No extraction jobs yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span>{job.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${job.progress * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">
                          {Math.round(job.progress * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{job.processedDocs} / {job.totalDocs}</TableCell>
                    <TableCell>{job.failedDocs}</TableCell>
                    <TableCell>
                      {new Date(job.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {job.completedAt
                        ? new Date(job.completedAt).toLocaleString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
