import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { ProjectDashboard } from './components/project-dashboard'

export default async function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      templates: {
        orderBy: { createdAt: 'desc' },
      },
      jobs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!project) {
    redirect('/')
  }

  return <ProjectDashboard project={project} />
}
