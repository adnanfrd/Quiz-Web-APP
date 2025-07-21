import { v4 as uuidv4 } from "uuid"

export interface Question {
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  durationMinutes: number
  maxAttempts: number
  questions: Question[]
  createdAt: string
}

export interface QuizResult {
  id: string
  quizId: string
  quizTitle: string
  studentAnswers: number[] // Array of selected option indices
  correctAnswers: number[] // Array of correct option indices
  score: number
  totalQuestions: number
  submittedAt: string
}

// In-memory store for demonstration purposes
const quizzes: Map<string, Quiz> = new Map()
const quizResults: Map<string, QuizResult[]> = new Map()

export function createQuiz(data: Omit<Quiz, "id" | "createdAt">): Quiz {
  const newQuiz: Quiz = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...data,
  }
  quizzes.set(newQuiz.id, newQuiz)
  return newQuiz
}

export function getQuiz(id: string): Quiz | undefined {
  return quizzes.get(id)
}

export function getQuizzes(): Quiz[] {
  return Array.from(quizzes.values())
}

export function saveQuizResult(
  quizId: string,
  quizTitle: string,
  studentAnswers: number[],
  correctAnswers: number[],
  score: number,
  totalQuestions: number,
): QuizResult {
  const newResult: QuizResult = {
    id: uuidv4(),
    quizId,
    quizTitle,
    studentAnswers,
    correctAnswers,
    score,
    totalQuestions,
    submittedAt: new Date().toISOString(),
  }

  if (!quizResults.has(quizId)) {
    quizResults.set(quizId, [])
  }
  quizResults.get(quizId)?.push(newResult)
  return newResult
}

export function getQuizResults(quizId: string): QuizResult[] {
  return quizResults.get(quizId) || []
}

// Optional: Seed some dummy data for testing
function seedData() {
  if (quizzes.size === 0) {
    const dummyQuiz1 = createQuiz({
      title: "General Knowledge Quiz",
      description: "Test your general knowledge!",
      durationMinutes: 10,
      maxAttempts: 1,
      questions: [
        {
          questionText: "What is the capital of France?",
          options: ["Berlin", "Madrid", "Paris", "Rome"],
          correctAnswerIndex: 2,
        },
        {
          questionText: "Which planet is known as the Red Planet?",
          options: ["Earth", "Mars", "Jupiter", "Venus"],
          correctAnswerIndex: 1,
        },
        {
          questionText: "What is 7 + 8?",
          options: ["14", "15", "16", "13"],
          correctAnswerIndex: 1,
        },
      ],
    })

    const dummyQuiz2 = createQuiz({
      title: "Science Basics",
      description: "A quick test on fundamental science concepts.",
      durationMinutes: 5,
      maxAttempts: 0, // Unlimited attempts
      questions: [
        {
          questionText: "What is the chemical symbol for water?",
          options: ["O2", "H2O", "CO2", "NaCl"],
          correctAnswerIndex: 1,
        },
        {
          questionText: "What is the largest organ in the human body?",
          options: ["Heart", "Brain", "Skin", "Liver"],
          correctAnswerIndex: 2,
        },
      ],
    })

    // Add some dummy results for dummyQuiz1
    saveQuizResult(
      dummyQuiz1.id,
      dummyQuiz1.title,
      [2, 1, 1], // Correct answers for dummyQuiz1
      [2, 1, 1],
      3,
      3,
    )
    saveQuizResult(
      dummyQuiz1.id,
      dummyQuiz1.title,
      [0, 1, 0], // Incorrect answers
      [2, 1, 1],
      1,
      3,
    )
  }
}

seedData()
