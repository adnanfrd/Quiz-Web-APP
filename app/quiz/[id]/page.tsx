import { getQuiz } from "@/lib/quiz-store"
import { notFound } from "next/navigation"
import QuizClientPage from "./quiz-client-page"

export default async function QuizPage({ params }: { params: { id: string } }) {
  const quiz = getQuiz(params.id)

  if (!quiz) {
    notFound()
  }

  return <QuizClientPage quiz={quiz} />
}
