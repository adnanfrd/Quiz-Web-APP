"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { submitQuiz } from "@/lib/actions" // Use the Server Action
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Quiz, Question } from "@/lib/quiz-store" // Import types from quiz-store
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface QuizClientPageProps {
  quiz: Quiz
}

export default function QuizClientPage({ quiz }: QuizClientPageProps) {
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { toast } = useToast()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const quizContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [showUserModal, setShowUserModal] = useState(true);
  const [isScreenFrozen, setIsScreenFrozen] = useState(true);

  // Prevent quiz interaction until user info is provided
  const quizLocked = showUserModal || !studentId || !studentName;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (quizSubmitted || quizLocked) return;

      setQuizSubmitted(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      const answersArray = quiz.questions.map((_, index) => currentAnswers[index] ?? -1)
      const result = await submitQuiz(
        quiz._id!,
        studentId,
        studentName,
        answersArray
      );

      if (result.success) {
        setScore(result.score ?? null)
        toast({
          title: autoSubmit ? "Quiz Auto-Submitted" : "Quiz Submitted",
          description: result.message || "Your quiz has been submitted.",
        })
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "There was an error submitting your quiz.",
          variant: "destructive",
        })
      }

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    },
    [quiz._id, currentAnswers, quizSubmitted, toast, studentId, studentName, quizLocked],
  )

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!)
            handleSubmit(true) // Auto-submit on timeout
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timeLeft, quizSubmitted, handleSubmit])

  // Anti-cheating measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !quizSubmitted) {
        setTabSwitchCount((prev) => prev + 1)
        setShowWarning(true)
        toast({
          title: "Warning: Tab Switched!",
          description: `You have switched tabs ${tabSwitchCount + 1} time(s). Excessive switching may lead to auto-submission.`,
          variant: "destructive",
        })
      }
    }

    const handleBlur = () => {
      if (!quizSubmitted) {
        setTabSwitchCount((prev) => prev + 1)
        setShowWarning(true)
        toast({
          title: "Warning: Window Lost Focus!",
          description: `You have switched away from the quiz window ${tabSwitchCount + 1} time(s). Excessive switching may lead to auto-submission.`,
          variant: "destructive",
        })
      }
    }

    const handleContextMenu = (e: Event) => {
      e.preventDefault()
      toast({
        title: "Action Blocked",
        description: "Right-click is disabled during the quiz.",
        variant: "destructive",
      })
    }

    const handleCopy = (e: Event) => {
      e.preventDefault()
      toast({
        title: "Action Blocked",
        description: "Copying text is disabled during the quiz.",
        variant: "destructive",
      })
    }

    const handleSelectStart = (e: Event) => {
      e.preventDefault()
    }

    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null)
      if (!document.fullscreenElement && !quizSubmitted) {
        toast({
          title: "Warning: Exited Fullscreen!",
          description: "Please remain in fullscreen mode during the quiz.",
          variant: "destructive",
        })
        setTabSwitchCount((prev) => prev + 1)
        setShowWarning(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("copy", handleCopy)
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("fullscreenchange", handleFullScreenChange)

    // Request fullscreen on component mount
    if (quizContainerRef.current && !document.fullscreenElement) {
      quizContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
        toast({
          title: "Fullscreen Recommended",
          description: "Please enable fullscreen mode for the best quiz experience and to avoid warnings.",
          variant: "default",
        })
      })
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
    }
  }, [quizSubmitted, tabSwitchCount, toast])

  // Auto-submit if tab switch count exceeds a threshold
  useEffect(() => {
    const MAX_TAB_SWITCHES = 3 // Configurable threshold
    if (tabSwitchCount >= MAX_TAB_SWITCHES && !quizSubmitted) {
      handleSubmit(true)
      toast({
        title: "Quiz Auto-Submitted",
        description: "You have exceeded the allowed tab switches. Your quiz has been automatically submitted.",
        variant: "destructive",
      })
    }
  }, [tabSwitchCount, quizSubmitted, handleSubmit, toast])

  // Block navigation and warn on tab close/refresh during active quiz
  useEffect(() => {
    if (!quizSubmitted && timeLeft > 0) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "You cannot leave the quiz until you submit or time runs out.";
        return e.returnValue;
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [quizSubmitted, timeLeft, toast]);

  // Block Escape key during quiz
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!quizSubmitted && (e.key === 'Escape' || e.key === 'Esc')) {
        e.preventDefault();
        e.stopPropagation();
        toast({
          title: "Fullscreen Required",
          description: "You cannot exit fullscreen until you submit the quiz or time runs out.",
          variant: "destructive",
        });
        if (!document.fullscreenElement && quizContainerRef.current) {
          quizContainerRef.current.requestFullscreen().catch(() => {});
        }
        return false;
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [quizSubmitted, toast]);

  // Re-request fullscreen if exited during quiz
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!quizSubmitted && !document.fullscreenElement && quizContainerRef.current) {
        toast({
          title: "Fullscreen Required",
          description: "You cannot exit fullscreen until you submit the quiz or time runs out.",
          variant: "destructive",
        });
        quizContainerRef.current.requestFullscreen().catch(() => {});
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [quizSubmitted, toast]);

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setCurrentAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  // Unfreeze screen after user modal is closed
  useEffect(() => {
    if (!showUserModal) {
      setIsScreenFrozen(false);
    }
  }, [showUserModal]);

  return (
    <div ref={quizContainerRef} 
         className={`min-h-screen flex flex-col items-center justify-center bg-background p-4`}
    >
      {/* User Info Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm transform transition-all duration-300 scale-100 hover:scale-105">
            <h2 className="text-xl font-bold mb-4">Enter Your Details</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">User ID</label>
              <Input
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="Enter your ID"
                autoFocus
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <Input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Enter your name"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200"
              disabled={!studentId || !studentName}
              onClick={() => setShowUserModal(false)}
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning: Anti-Cheating Detected!</AlertDialogTitle>
            <AlertDialogDescription>
              You have switched tabs or exited fullscreen. Repeated actions will result in automatic quiz submission.
              Please stay focused on the quiz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarning(false)}>I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hide quiz content while user modal is open */}
      {!showUserModal && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{quiz.title}</CardTitle>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Time Left: {formatTime(timeLeft)}
              </span>
              <Progress value={(timeLeft / (quiz.durationMinutes * 60)) * 100} className="w-1/2 h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.questions.map((q: Question, qIndex: number) => (
              <div key={qIndex} className="border-b pb-4 last:border-b-0 last:pb-0">
                <p className="font-medium mb-3">
                  {qIndex + 1}. {q.questionText}
                </p>
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(qIndex, Number.parseInt(value))}
                  value={currentAnswers[qIndex]?.toString() ?? ""}
                  className="space-y-2"
                  disabled={quizSubmitted || quizLocked}
                >
                  {q.options.map((option: string, oIndex: number) => (
                    <div
                      key={oIndex}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    >
                      <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button
              onClick={() => handleSubmit()}
              disabled={quizSubmitted || timeLeft <= 0 || quizLocked}
              className="hover:bg-blue-700 transition-colors duration-200"
            >
              {quizSubmitted ? "Submitted" : "Submit Quiz"}
            </Button>
            {quizSubmitted && score !== null && (
              <p className="text-lg font-semibold">
                Your Score: {score} / {quiz.questions.length} <br />
                Submitted at: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}