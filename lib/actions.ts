"use server"

import { createQuizInDb, getQuizFromDb, saveQuizResultInDb } from "./quiz-store"
import { revalidatePath } from "next/cache"
import type { Question } from "./quiz-store" // Import Question type

interface CreateQuizData {
  title: string
  description: string
  durationMinutes: number
  maxAttempts: number
  questions: Question[]
}

export async function createQuiz(data: CreateQuizData) {
  try {
    const newQuiz = await createQuizInDb(data)
    revalidatePath("/") // Revalidate root path to show new quiz on admin dashboard
    return { success: true, quizId: newQuiz._id }
  } catch (error: any) {
    console.error("Error creating quiz:", error)
    return { success: false, message: error.message || "Failed to create quiz." }
  }
}

export async function submitQuiz(quizId: string, studentAnswers: number[]) {
  try {
    const quiz = await getQuizFromDb(quizId)
    if (!quiz) {
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

    await saveQuizResultInDb(quizId, quiz.title, studentAnswers, correctAnswers, score, quiz.questions.length)
    revalidatePath(`/quizzes/${quizId}/results`) // Revalidate results page

    return { success: true, score, message: "Quiz submitted successfully!" }
  } catch (error: any) {
    console.error("Error submitting quiz:", error)
    return { success: false, message: error.message || "Failed to submit quiz." }
  }
}
