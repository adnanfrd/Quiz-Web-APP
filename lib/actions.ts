"use server"

import { createQuizInDb, getQuizFromDb, saveQuizResultInDb, deleteQuizFromDb } from "./quiz-store"
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

export async function submitQuiz(quizId: string, studentId: string, studentName: string, studentAnswers: number[]) {
  try {
    console.log(`Server Action: submitQuiz - Attempting to get quiz ${quizId} from DB.`)
    const quiz = await getQuizFromDb(quizId)
    if (!quiz) {
      console.warn(`Server Action: submitQuiz - Quiz ${quizId} not found.`)
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

    console.log(`Server Action: submitQuiz - Saving quiz result for quiz ${quizId}. Score: ${score}`)
    await saveQuizResultInDb(
      quizId,
      quiz.title,
      studentId,
      studentName,
      studentAnswers,
      correctAnswers,
      score,
      quiz.questions.length
    )
    console.log("Server Action: submitQuiz - Quiz result saved successfully.")
    revalidatePath(`/quizzes/${quizId}/results`)

    return { success: true, score, message: "Quiz submitted successfully!" }
  } catch (error: any) {
    console.error("Error in submitQuiz Server Action:", error)
    return { success: false, message: error.message || "Failed to submit quiz." }
  }
}

export async function deleteQuiz(quizId: string) {
  try {
    const result = await deleteQuizFromDb(quizId);
    if (result.success) {
      revalidatePath("/");
      return { success: true };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete quiz." };
  }
}
