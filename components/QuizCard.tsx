"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Clock, Repeat, Share2, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

export default function QuizCard({ quiz }: { quiz: any }) {
  const router = useRouter()

  const handleCopy = () => {
    const url = `${window.location.origin}/quiz/${quiz._id}`
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this quiz?")
    if (!confirmed) return

    try {
      const res = await fetch(`/quiz/${quiz._id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        alert("Quiz deleted!")
        router.refresh()
      } else {
        alert("Failed to delete quiz: " + data.message)
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
      alert("An error occurred.")
    }
  }

  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-200 rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          {quiz.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {quiz.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Duration: {quiz.durationMinutes} minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <span>Attempts:</span>
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

     {/* Action Buttons */}
<CardContent className="pt-0">
  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopy}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy the quiz link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="secondary"
        size="sm"
        asChild
        className="flex-1"
      >
        <Link href={`/quizzes/${quiz._id}/results`}>
          <Eye className="mr-2 h-4 w-4" />
          View Results
        </Link>
      </Button>
    </div>

   
  </div>
  <div className="text-center p-4">
     <Button
      variant="destructive"
      size="sm"
      className="w-full md:w-auto mt-2 md:mt-0"
      onClick={handleDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Quiz
    </Button>
  </div>
</CardContent>

    </Card>
  )
}
