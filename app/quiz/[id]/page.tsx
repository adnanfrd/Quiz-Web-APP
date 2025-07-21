import { notFound } from "next/navigation"
import QuizClientPage from "./quiz-client-page"
import { getQuizFromDb } from "@/lib/quiz-store" // Import from the new quiz-store

export default async function QuizPage({ params }: { params: { id: string } }) {
  const quiz = await getQuizFromDb(params.id)

  if (!quiz) {
    notFound()
  }

  return <QuizClientPage quiz={quiz} />
}
