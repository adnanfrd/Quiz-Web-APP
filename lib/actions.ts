"use server"

import { createQuizInDb, getQuizFromDb, saveQuizResultInDb } from "./quiz-store"
import { revalidatePath } from "next/cache"
import type { Question } from "./quiz-store"

interface CreateQuizData {
  title: string
  description: string
  durationMinutes: number
  maxAttempts: number
  questions: Question[]
}

export async function createQuiz(data: CreateQuizData) {
  try {
    console.log("Server Action: createQuiz - Attempting to create quiz in DB.") // Add this log
    const newQuiz = await createQuizInDb(data)
    console.log("Server Action: createQuiz - Quiz created successfully:", newQuiz._id) // Add this log
    revalidatePath("/")
    return { success: true, quizId: newQuiz._id }
  } catch (error: any) {
    console.error("Error in createQuiz Server Action:", error)
    return { success: false, message: error.message || "Failed to create quiz." }
  }
}

export async function submitQuiz(quizId: string, studentAnswers: number[]) {
  try {
    console.log(`Server Action: submitQuiz - Attempting to get quiz ${quizId} from DB.`) // Add this log
    const quiz = await getQuizFromDb(quizId)
    if (!quiz) {
      console.warn(`Server Action: submitQuiz - Quiz ${quizId} not found.`) // Add this log
      return { success: false, message: "Quiz not found." }
    }

    let score = 0
    const correctAnswers: number[] = []

    quiz.questions.forEach((question, index) => {
      correctAnswers.push(question.correctAnswerIndex)
      if (studentAnswers[index] === question.correctAnswerIndex) {
        score++
      }
    })

    console.log(`Server Action: submitQuiz - Saving quiz result for quiz ${quizId}. Score: ${score}`) // Add this log
    await saveQuizResultInDb(quizId, quiz.title, studentAnswers, correctAnswers, score, quiz.questions.length)
    console.log("Server Action: submitQuiz - Quiz result saved successfully.") // Add this log
    revalidatePath(`/quizzes/${quizId}/results`)

    return { success: true, score, message: "Quiz submitted successfully!" }
  } catch (error: any) {
    console.error("Error in submitQuiz Server Action:", error)
    return { success: false, message: error.message || "Failed to submit quiz." }
  }
}
