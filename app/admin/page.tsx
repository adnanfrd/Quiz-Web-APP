'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { deleteQuiz } from "@/lib/actions";
import { useTransition, useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      setQuizzes(data);
      setLoading(false);
    }
    fetchQuizzes();
  }, []);

  function QuizCard({ quiz }: { quiz: any }) {
    const [isPending, startTransition] = useTransition();
    return (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/quiz/${quiz._id}`;
                navigator.clipboard.writeText(url);
                alert("Quiz link copied to clipboard!");
              }}
            >
              Share Link
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/quizzes/${quiz._id}/results`}>View Results</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this quiz? This cannot be undone.")) {
                  startTransition(async () => {
                    await deleteQuiz(quiz._id);
                    window.location.reload();
                  });
                }
              }}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
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
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground">Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No quizzes created yet. Click "Create New Quiz" to get started!
          </p>
        ) : (
          quizzes.map((quiz: any) => <QuizCard key={quiz._id} quiz={quiz} />)
        )}
      </div>
    </div>
  );
}
