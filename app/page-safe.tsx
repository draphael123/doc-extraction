import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { ProjectsList } from './components/projects-list'

export default async function Home() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      redirect('/auth/signin')
    }

    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage your document extraction projects
          </p>
        </div>
        <ProjectsList />
      </div>
    )
  } catch (error) {
    console.error('Error in page.tsx:', error)
    // If there's an error, redirect to signin or show error
    redirect('/auth/signin')
  }
}
