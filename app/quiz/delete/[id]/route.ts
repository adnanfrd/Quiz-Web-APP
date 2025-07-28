import { deleteQuizFromDb } from "@/lib/quiz-store"
import { NextResponse } from "next/server"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const result = await deleteQuizFromDb(id)
    if (!result.success) throw new Error(result.message)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
