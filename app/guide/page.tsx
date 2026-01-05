import { readFile } from 'fs/promises'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'

export const dynamic = 'force-dynamic'

export default async function GuidePage() {
  let guideContent = ''
  
  try {
    const filePath = join(process.cwd(), 'USER_GUIDE.md')
    guideContent = await readFile(filePath, 'utf-8')
  } catch (error) {
    guideContent = '# User Guide\n\nGuide content not available.'
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <a 
          href="/" 
          className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2"
        >
          ← Back to Home
        </a>
      </div>
      <article className="prose prose-lg max-w-none bg-white rounded-lg shadow-lg p-8">
        <ReactMarkdown>{guideContent}</ReactMarkdown>
      </article>
    </div>
  )
}

