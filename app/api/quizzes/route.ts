import { NextResponse } from 'next/server';
import { getQuizzesFromDb } from '@/lib/quiz-store';

export async function GET() {
  const quizzes = await getQuizzesFromDb();
  return NextResponse.json(quizzes);
} 