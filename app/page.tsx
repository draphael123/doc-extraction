import { ProjectsList } from './components/projects-list'
import Link from 'next/link'
import { BookOpen, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Document Scrapper
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your document extraction projects
            </p>
          </div>
          <Link href="/guide">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
              <BookOpen className="mr-2 h-4 w-4" />
              User Guide
            </Button>
          </Link>
        </div>
        
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
