import { ProjectsList } from './components/projects-list'

export default async function Home() {
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
}
