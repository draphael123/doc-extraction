'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileText, Download, Eye, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface Template {
  id: string
  name: string
}

interface ExtractionResult {
  id: string
  document: {
    id: string
    originalName: string
  }
  fieldResults: any[]
  status: string
}

export function ResultsTab({
  projectId,
  templates,
}: {
  projectId: string
  templates: Template[]
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [results, setResults] = useState<ExtractionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7])
  const [showNeedsReview, setShowNeedsReview] = useState(false)
  const [selectedResult, setSelectedResult] = useState<ExtractionResult | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    if (selectedTemplate) {
      fetchResults()
    }
  }, [selectedTemplate, projectId])

  async function fetchResults() {
    if (!selectedTemplate) return

    setLoading(true)
    try {
      const res = await fetch(
        `/api/results?projectId=${projectId}&templateId=${selectedTemplate}`
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generatePDF() {
    if (!selectedTemplate) {
      alert('Please select a template')
      return
    }

    setGeneratingPdf(true)
    try {
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          templateId: selectedTemplate,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        window.open(data.url, '_blank')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    } finally {
      setGeneratingPdf(false)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'NEEDS_REVIEW':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'MISSING':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const filteredResults = results.filter((result) => {
    if (showNeedsReview) {
      return result.status === 'NEEDS_REVIEW' || result.fieldResults.some((fr: any) => fr.status === 'needs_review')
    }
    return true
  }).filter((result) => {
    return result.fieldResults.every((fr: any) => 
      fr.confidence >= confidenceThreshold[0] || fr.status === 'missing'
    )
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>View Results</CardTitle>
          <CardDescription>
            Review extraction results and generate master PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
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

          {selectedTemplate && (
            <>
              <div className="space-y-2">
                <Label>Confidence Threshold: {confidenceThreshold[0].toFixed(2)}</Label>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needsReview"
                  checked={showNeedsReview}
                  onChange={(e) => setShowNeedsReview(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="needsReview">Show only needs review</Label>
              </div>

              <Button 
                onClick={generatePDF} 
                disabled={generatingPdf || results.length === 0}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
              >
                <Download className="mr-2 h-4 w-4" />
                {generatingPdf ? 'Generating...' : 'Generate Master PDF'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({filteredResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading results...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          {result.document.originalName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result.status)}
                          <span>{result.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.fieldResults.filter((fr: any) => fr.value !== null).length} / {result.fieldResults.length}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResult(result)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{result.document.originalName}</DialogTitle>
                              <DialogDescription>Review and edit extracted fields</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {result.fieldResults.map((fieldResult: any, idx: number) => (
                                <div key={idx} className="space-y-2 border-b pb-4">
                                  <div className="flex justify-between items-center">
                                    <Label className="font-semibold">{fieldResult.fieldName}</Label>
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(fieldResult.status)}
                                      <span className="text-xs text-muted-foreground">
                                        Confidence: {(fieldResult.confidence * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                  <Input
                                    value={fieldResult.value || ''}
                                    readOnly
                                    className="bg-muted"
                                  />
                                  {fieldResult.sourceSnippet && (
                                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                                      Source: {fieldResult.sourceSnippet}
                                      {fieldResult.sourcePage && ` (Page ${fieldResult.sourcePage})`}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
