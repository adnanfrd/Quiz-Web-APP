import { getQuizResultsFromDb } from "@/lib/quiz-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const quizResults = getQuizResultsFromDb(params.id)

  if (!quizResults || quizResults.length === 0) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
        <p className="text-muted-foreground">No results found for this quiz yet.</p>
      </div>
    )
  }

  const quizTitle = quizResults[0].quizTitle // Assuming all results are for the same quiz

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Results for: {quizTitle}</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission ID</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Answers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {result.score} / {result.totalQuestions}
                  </TableCell>
                  <TableCell>{format(new Date(result.submittedAt), "PPP p")}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside text-sm">
                      {result.studentAnswers.map((answer, qIndex) => (
                        <li key={qIndex}>
                          Q{qIndex + 1}: {answer === -1 ? "Not Answered" : `Option ${answer + 1}`}
                          {result.correctAnswers[qIndex] !== undefined && (
                            <span className="ml-2 text-muted-foreground">
                              (Correct: Option {result.correctAnswers[qIndex] + 1})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
