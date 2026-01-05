import { ProjectsList } from './components/projects-list'

export default async function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Document Scrapper
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your document extraction projects
        </p>
      </div>
      <ProjectsList />
    </div>
  )
}
