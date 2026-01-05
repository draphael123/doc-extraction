import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PUBLIC_USER_ID } from '@/lib/public-user'
import { ProjectDashboard } from './components/project-dashboard'

export default async function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      userId: PUBLIC_USER_ID,
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

  // Parse JSON strings in templates for client components
  const parsedProject = {
    ...project,
    templates: project.templates.map(t => ({
      ...t,
      fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : t.fields,
    })),
  }

  return <ProjectDashboard project={parsedProject} />
}
