import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getQuizzesFromDb } from "@/lib/quiz-store"
import { Clock, Repeat, Share2, Eye, PlusCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboardPage() {
  const quizzes = await getQuizzesFromDb()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between h-16 px-6 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
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

      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="grid gap-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">Your Quizzes</h2>
          {quizzes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz._id}
                  className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{quiz.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration: {quiz.durationMinutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <span>Attempts: </span>
                      {quiz.maxAttempts === 0 ? (
                        <Badge variant="secondary">Unlimited</Badge>
                      ) : (
                        <Badge variant="secondary">{quiz.maxAttempts}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                      Created: {format(new Date(quiz.createdAt), "PPP")}
                    </p>
                  </CardContent>
                  <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Share2 className="mr-2 h-4 w-4" />
                            <Link href={`/quiz/${quiz._id}`}>Share Link</Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to get the shareable quiz link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="secondary" size="sm" asChild className="flex-1">
                      <Link href={`/quizzes/${quiz._id}/results`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Results
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
