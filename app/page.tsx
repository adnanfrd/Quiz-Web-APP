import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getQuizzesFromDb } from "@/lib/quiz-store"
import {PlusCircle } from "lucide-react"
import QuizCard from "@/components/QuizCard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const quizzes = await getQuizzesFromDb()

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Admin Dashboard</h1>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/quizzes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Quiz
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-8">Your Quizzes</h2>

          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-lg text-muted-foreground mb-4">
                No quizzes created yet. Click "Create New Quiz" to get started!
              </p>
              <Button asChild>
                <Link href="/quizzes/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Quiz
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
