import { ProjectsList } from './components/projects-list'
import Link from 'next/link'
import { BookOpen, HelpCircle, FileText, FolderOpen, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from './components/stats-card'

export default async function Home() {
  // Fetch statistics directly from database
  let stats = null
  try {
    const { prisma } = await import('@/lib/prisma')
    const { PUBLIC_USER_ID } = await import('@/lib/public-user')
    
    const [totalProjects, totalDocuments, totalTemplates, completedDocs] = await Promise.all([
      prisma.project.count({ where: { userId: PUBLIC_USER_ID } }),
      prisma.document.count({
        where: { project: { userId: PUBLIC_USER_ID } },
      }),
      prisma.extractionTemplate.count({
        where: { project: { userId: PUBLIC_USER_ID } },
      }),
      prisma.document.count({
        where: {
          project: { userId: PUBLIC_USER_ID },
          status: 'COMPLETED',
        },
      }),
    ])

    const successRate = totalDocuments > 0 ? Math.round((completedDocs / totalDocuments) * 100) : 0

    stats = {
      totalProjects,
      totalDocuments,
      totalTemplates,
      successRate,
    }
  } catch (error) {
    // Silently fail - stats are optional
    console.error('Error fetching stats:', error)
  }
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Document Scrapper
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Extract and organize information from large document bases
            </p>
            
            {/* Purpose Explanation */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
              <CardHeader>
                <CardTitle className="text-purple-900 text-xl">
                  What is Document Scrapper?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  Document Scrapper is a powerful platform designed to help you extract structured information from 
                  thousands of documents automatically. Whether you're processing invoices, contracts, reports, or 
                  any other document type, we make it easy to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>Upload & Organize</strong> - Upload hundreds or thousands of PDF, Word, text, or CSV files in one go</li>
                  <li><strong>Define Templates</strong> - Create custom extraction templates using regex patterns, keyword matching, or AI</li>
                  <li><strong>Batch Process</strong> - Automatically extract data from all your documents in parallel batches</li>
                  <li><strong>Review & Edit</strong> - Review extracted results, edit values, and filter by confidence scores</li>
                  <li><strong>Generate Reports</strong> - Compile all extracted data into professional PDF reports with table of contents</li>
                </ul>
                <p className="leading-relaxed pt-2 border-t border-purple-200">
                  Perfect for financial document processing, invoice management, contract analysis, data migration, 
                  and any workflow that requires extracting structured information from unstructured documents at scale.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="ml-6">
            <Link href="/guide">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                <BookOpen className="mr-2 h-4 w-4" />
                User Guide
              </Button>
            </Link>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={<FolderOpen className="h-5 w-5" />}
              color="blue"
            />
            <StatsCard
              title="Documents"
              value={stats.totalDocuments}
              icon={<FileText className="h-5 w-5" />}
              color="purple"
            />
            <StatsCard
              title="Templates"
              value={stats.totalTemplates}
              icon={<BookOpen className="h-5 w-5" />}
              color="green"
            />
            <StatsCard
              title="Success Rate"
              value={`${stats.successRate}%`}
              icon={<CheckCircle className="h-5 w-5" />}
              color="orange"
            />
          </div>
        )}

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Getting Started?</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              New to Document Scrapper? Check out our comprehensive user guide to learn how to extract information from your documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/guide">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <BookOpen className="mr-2 h-4 w-4" />
                Read the User Guide
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <ProjectsList />
    </div>
  )
}
