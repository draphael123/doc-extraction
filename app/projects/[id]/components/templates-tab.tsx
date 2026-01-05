'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, FileText, Trash2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string
  fields: any[]
  createdAt: string
}

export function TemplatesTab({
  projectId,
  templates: initialTemplates,
}: {
  projectId: string
  templates: Template[]
}) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<any[]>([
    {
      fieldName: '',
      description: '',
      type: 'string',
      required: false,
      extractionMethod: 'regex',
    },
  ])
  const [creating, setCreating] = useState(false)

  async function createTemplate() {
    if (!name.trim() || fields.length === 0) return

    setCreating(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name,
          description,
          fields: fields.filter((f) => f.fieldName.trim()),
        }),
      })

      if (res.ok) {
        const template = await res.json()
        setTemplates((prev) => [template, ...prev])
        setOpen(false)
        setName('')
        setDescription('')
        setFields([{ fieldName: '', description: '', type: 'string', required: false, extractionMethod: 'regex' }])
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Failed to create template')
    } finally {
      setCreating(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      } else {
        alert('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }

  function addField() {
    setFields([
      ...fields,
      {
        fieldName: '',
        description: '',
        type: 'string',
        required: false,
        extractionMethod: 'regex',
      },
    ])
  }

  function updateField(index: number, updates: Partial<any>) {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Extraction Templates</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Extraction Template</DialogTitle>
              <DialogDescription>
                Define fields to extract from documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Invoice Extraction"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Extract invoice details"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Fields</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addField}>
                    Add Field
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field Name</Label>
                          <Input
                            value={field.fieldName}
                            onChange={(e) =>
                              updateField(index, { fieldName: e.target.value })
                            }
                            placeholder="invoice_number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, { type: e.target.value })
                            }
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="boolean">Boolean</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={field.description}
                          onChange={(e) =>
                            updateField(index, { description: e.target.value })
                          }
                          placeholder="Invoice number field"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Extraction Method</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={field.extractionMethod}
                          onChange={(e) =>
                            updateField(index, { extractionMethod: e.target.value })
                          }
                        >
                          <option value="regex">Regex</option>
                          <option value="keyword+window">Keyword + Window</option>
                          <option value="llm">LLM (Coming Soon)</option>
                        </select>
                      </div>
                      {field.extractionMethod === 'regex' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Pattern</Label>
                            <Input
                              value={field.pattern || ''}
                              onChange={(e) =>
                                updateField(index, { pattern: e.target.value })
                              }
                              placeholder="Invoice #: (\d+)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Flags (optional)</Label>
                            <Input
                              value={field.flags || ''}
                              onChange={(e) =>
                                updateField(index, { flags: e.target.value })
                              }
                              placeholder="gi"
                            />
                          </div>
                        </div>
                      )}
                      {field.extractionMethod === 'keyword+window' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Keywords (comma-separated)</Label>
                            <Input
                              value={field.keywords?.join(', ') || ''}
                              onChange={(e) =>
                                updateField(index, {
                                  keywords: e.target.value.split(',').map((k) => k.trim()),
                                })
                              }
                              placeholder="Invoice Number, Invoice #"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Window Size</Label>
                            <Input
                              type="number"
                              value={field.windowSize || 200}
                              onChange={(e) =>
                                updateField(index, {
                                  windowSize: parseInt(e.target.value) || 200,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) =>
                              updateField(index, { required: e.target.checked })
                            }
                            className="rounded"
                          />
                          <span className="text-sm">Required</span>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createTemplate}
                disabled={creating || !name.trim() || fields.length === 0}
              >
                {creating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No templates yet</p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {template.fields.length} field(s)
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {template.fields.map((field: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{field.fieldName}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.extractionMethod}</TableCell>
                        <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
