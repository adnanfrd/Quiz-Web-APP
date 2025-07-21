import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getQuizzesFromDb } from "@/lib/quiz-store";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
  let quizzes = [];

  try {
    quizzes = await getQuizzesFromDb();
  } catch (err) {
    console.error("Failed to fetch quizzes:", err);
    // Optionally render an error UI
    return (
      <div className="text-center text-red-500">
        Failed to load quizzes. Please check the server connection.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Quizzes</h2>
        <Button asChild>
          <Link href="/admin/quizzes/new">Create New Quiz</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No quizzes created yet. Click "Create New Quiz" to get started!
          </p>
        ) : (
          quizzes.map((quiz: any) => (
            <Card key={quiz._id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
                <p className="text-sm">Duration: {quiz.durationMinutes} minutes</p>
                <p className="text-sm">Attempts: {quiz.maxAttempts === 0 ? "Unlimited" : quiz.maxAttempts}</p>
                <p className="text-sm">Created: {format(new Date(quiz.createdAt), "PPP")}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/quiz/${quiz._id}`}>Share Link</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/quizzes/${quiz._id}/results`}>View Results</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
