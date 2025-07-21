"use server"

import { createQuiz as storeCreateQuiz, saveQuizResult, getQuiz } from "./quiz-store"
import { revalidatePath } from "next/cache"

interface CreateQuizData {
  title: string
  description: string
  durationMinutes: number
  maxAttempts: number
  questions: {
    questionText: string
    options: string[]
    correctAnswerIndex: number
  }[]
}

export async function createQuiz(data: CreateQuizData) {
  try {
    const newQuiz = storeCreateQuiz(data)
    revalidatePath("/admin") // Revalidate admin dashboard to show new quiz
    return { success: true, quizId: newQuiz.id }
  } catch (error: any) {
    console.error("Error creating quiz:", error)
    return { success: false, message: error.message || "Failed to create quiz." }
  }
}

export async function submitQuiz(quizId: string, studentAnswers: number[]) {
  try {
    const quiz = getQuiz(quizId)
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

    saveQuizResult(quizId, quiz.title, studentAnswers, correctAnswers, score, quiz.questions.length)
    revalidatePath(`/admin/quizzes/${quizId}/results`) // Revalidate results page

    return { success: true, score, message: "Quiz submitted successfully!" }
  } catch (error: any) {
    console.error("Error submitting quiz:", error)
    return { success: false, message: error.message || "Failed to submit quiz." }
  }
}
