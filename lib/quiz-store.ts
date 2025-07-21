import dbConnect from "./mongodb"
import mongoose from "mongoose"

// Define Mongoose Schemas
const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswerIndex: { type: Number, required: true },
})

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  durationMinutes: { type: Number, required: true, min: 1 },
  maxAttempts: { type: Number, required: true, min: 0 }, // 0 for unlimited
  questions: { type: [QuestionSchema], required: true },
  createdAt: { type: Date, default: Date.now },
})

const QuizResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  quizTitle: { type: String, required: true },
  studentAnswers: { type: [Number], required: true },
  correctAnswers: { type: [Number], required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
})

// Export Mongoose Models
export const QuizModel = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema)
export const QuizResultModel = mongoose.models.QuizResult || mongoose.model("QuizResult", QuizResultSchema)

// Define TypeScript interfaces for data
export interface Question {
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

export interface Quiz {
  _id?: string // MongoDB ID
  title: string
  description: string
  durationMinutes: number
  maxAttempts: number
  questions: Question[]
  createdAt: string
}

export interface QuizResult {
  _id?: string // MongoDB ID
  quizId: string
  quizTitle: string
  studentAnswers: number[] // Array of selected option indices
  correctAnswers: number[] // Array of correct option indices
  score: number
  totalQuestions: number
  submittedAt: string
}

// Data access functions
export async function createQuizInDb(data: Omit<Quiz, "_id" | "createdAt">): Promise<Quiz> {
  await dbConnect()
  const newQuiz = new QuizModel(data)
  await newQuiz.save()
  return newQuiz.toObject()
}

export async function getQuizFromDb(id: string): Promise<Quiz | null> {
  await dbConnect()
  const quiz = await QuizModel.findById(id).lean()
  return quiz as Quiz | null // ✅ Fix
}

export async function getQuizzesFromDb(): Promise<Quiz[]> {
  await dbConnect()
  const quizzes = await QuizModel.find({}).lean()
  return quizzes as unknown as Quiz[] // ✅ Fix
}

export async function saveQuizResultInDb(
  quizId: string,
  quizTitle: string,
  studentAnswers: number[],
  correctAnswers: number[],
  score: number,
  totalQuestions: number,
): Promise<QuizResult> {
  await dbConnect()
  const newResult = new QuizResultModel({
    quizId,
    quizTitle,
    studentAnswers,
    correctAnswers,
    score,
    totalQuestions,
  })
  await newResult.save()
  return newResult.toObject()
}

export async function getQuizResultsFromDb(quizId: string): Promise<QuizResult[]> {
  await dbConnect()
  const results = await QuizResultModel.find({ quizId }).lean()
  return results as unknown as QuizResult[] // ✅ Fix
}

// Optional: Seed some dummy data for testing
async function seedData() {
  await dbConnect()
  const quizCount = await QuizModel.countDocuments()
  if (quizCount === 0) {
    const dummyQuiz1 = await createQuizInDb({
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

    const dummyQuiz2 = await createQuizInDb({
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
    await saveQuizResultInDb(
      dummyQuiz1._id!.toString(),
      dummyQuiz1.title,
      [2, 1, 1], // Correct answers for dummyQuiz1
      [2, 1, 1],
      3,
      3,
    )
    await saveQuizResultInDb(
      dummyQuiz1._id!.toString(),
      dummyQuiz1.title,
      [0, 1, 0], // Incorrect answers
      [2, 1, 1],
      1,
      3,
    )
    console.log("Dummy data seeded.")
  } else {
    console.log("Database already contains quizzes, skipping seeding.")
  }
}

// Call seedData on server startup (e.g., in a global setup file or API route)
// For Next.js, this might be called in a top-level API route or a global setup.
// For simplicity, we'll call it here, but in a larger app, consider a dedicated setup script.
seedData().catch(console.error)
