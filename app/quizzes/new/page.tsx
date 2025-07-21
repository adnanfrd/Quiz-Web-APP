"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, XCircle } from "lucide-react"
import { createQuiz } from "@/lib/actions" // This is now a Server Action
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Question {
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

export default function CreateQuizPage() {
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", options: ["", "", "", ""], correctAnswerIndex: -1 },
  ])
  const { toast } = useToast()
  const router = useRouter()

  const addQuestion = () => {
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswerIndex: -1 }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index].questionText = value
    setQuestions(newQuestions)
  }

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options[oIndex] = value
    setQuestions(newQuestions)
  }

  const handleCorrectAnswerChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].correctAnswerIndex = Number.parseInt(value)
    setQuestions(newQuestions)
  }

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options.push("")
    setQuestions(newQuestions)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex)
    if (newQuestions[qIndex].correctAnswerIndex === oIndex) {
      newQuestions[qIndex].correctAnswerIndex = -1 // Reset if correct answer is removed
    } else if (newQuestions[qIndex].correctAnswerIndex > oIndex) {
      newQuestions[qIndex].correctAnswerIndex-- // Adjust index if correct answer is after removed option
    }
    setQuestions(newQuestions)
  }

  const handleSubmit = async (formData: FormData) => {
    // Keep as Server Action form submission
    const quizData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      durationMinutes: Number.parseInt(formData.get("durationMinutes") as string),
      maxAttempts: Number.parseInt(formData.get("maxAttempts") as string),
      questions: questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
      })),
    }

    if (!quizData.title || quizData.questions.length === 0) {
      toast({
        title: "Error",
        description: "Quiz title and at least one question are required.",
        variant: "destructive",
      })
      return
    }

    for (const q of quizData.questions) {
      if (!q.questionText || q.options.some((opt) => !opt) || q.correctAnswerIndex === -1) {
        toast({
          title: "Error",
          description: "All questions must have text, options, and a correct answer selected.",
          variant: "destructive",
        })
        return
      }
    }

    const result = await createQuiz(quizData)

    if (result.success) {
      toast({
        title: "Success",
        description: "Quiz created successfully!",
      })
      router.push("/") // Redirect to the root admin page
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to create quiz.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      <form action={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input id="durationMinutes" name="durationMinutes" type="number" defaultValue={30} min={1} required />
              </div>
              <div>
                <Label htmlFor="maxAttempts">Max Attempts (0 for unlimited)</Label>
                <Input id="maxAttempts" name="maxAttempts" type="number" defaultValue={1} min={0} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="border p-4 rounded-md relative space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="sr-only">Remove question</span>
                </Button>
                <div>
                  <Label htmlFor={`question-${qIndex}`}>Question {qIndex + 1}</Label>
                  <Input
                    id={`question-${qIndex}`}
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    placeholder="Enter question text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  <RadioGroup
                    onValueChange={(value) => handleCorrectAnswerChange(qIndex, value)}
                    value={q.correctAnswerIndex.toString()}
                  >
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={oIndex.toString()} id={`option-${qIndex}-${oIndex}`} />
                        <Label htmlFor={`option-${qIndex}-${oIndex}`} className="flex-1">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                        </Label>
                        {q.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-muted-foreground hover:text-red-500"
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Remove option</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addQuestion} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          Create Quiz
        </Button>
      </form>
    </div>
  )
}
