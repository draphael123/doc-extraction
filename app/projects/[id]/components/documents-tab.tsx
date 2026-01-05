'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, File, AlertCircle } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  originalName: string
  fileSize: number
  status: string
  errorMessage?: string
  createdAt: string
}

export function DocumentsTab({
  projectId,
  documents: initialDocuments,
}: {
  projectId: string
  documents: Document[]
}) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [filteredDocuments, setFilteredDocuments] = useState(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      const formData = new FormData()
      acceptedFiles.forEach((file) => {
        formData.append('files', file)
      })

      try {
        const res = await fetch(`/api/projects/${projectId}/upload`, {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          setDocuments((prev) => [...data.documents, ...prev])
          setFilteredDocuments((prev) => [...data.documents, ...prev])
          toast.success(`Successfully uploaded ${data.documents.length} file(s)`)
        } else {
          const error = await res.json()
          toast.error(error.error || 'Failed to upload files')
        }
      } catch (error) {
        console.error('Error uploading files:', error)
        toast.error('Failed to upload files')
      } finally {
        setUploading(false)
      }
    },
    [projectId]
  )

  // Filter documents based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = documents.filter((doc) =>
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDocuments(filtered)
    } else {
      setFilteredDocuments(documents)
    }
  }, [searchQuery, documents])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
    },
    multiple: true,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 font-semibold'
      case 'PROCESSING':
        return 'text-blue-600 font-semibold animate-pulse'
      case 'FAILED':
        return 'text-red-600 font-semibold'
      default:
        return 'text-gray-600 font-semibold'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload PDF, DOCX, TXT, CSV files or ZIP archives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-blue-100 scale-105 shadow-lg'
                : 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, TXT, CSV, or ZIP files
            </p>
          </div>
          {uploading && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Uploading files...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <File className="mr-2 h-4 w-4" />
                        {doc.originalName}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(doc.status)}>
                        {doc.status}
                      </span>
                      {doc.errorMessage && (
                        <div className="flex items-center text-xs text-red-600 mt-1">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {doc.errorMessage}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(doc.createdAt).toLocaleDateString()}
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
