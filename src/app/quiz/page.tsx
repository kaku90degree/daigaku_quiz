'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizSession, QuizResult } from '@/types'
import { ProgressBar } from '@/components/quiz/ProgressBar'
import { ChoiceButton } from '@/components/quiz/ChoiceButton'
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback'

const GENRE_LABELS: Record<string, string> = {
  'owner-type': '設置者区分',
  faculty: '設置学部',
  'founded-year': '設立年',
}
const DIFF_LABELS: Record<string, string> = {
  easy: '易', medium: '中', hard: '難',
}

export default function QuizPage() {
  const router = useRouter()
  const [session, setSession] = useState<QuizSession | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('quizSession')
    if (!raw) { router.replace('/'); return }
    setSession(JSON.parse(raw))
  }, [router])

  if (!session) return null

  const { questions, currentIndex } = session
  const question = questions[currentIndex]
  const isAnswered = selected !== null
  const isCorrect = selected === question.correctAnswer
  const isLast = currentIndex === questions.length - 1

  const handleAnswer = (choice: string) => {
    if (isAnswered) return
    setSelected(choice)
    const newAnswers = [...session.answers]
    newAnswers[currentIndex] = choice
    const updated = { ...session, answers: newAnswers }
    setSession(updated)
    sessionStorage.setItem('quizSession', JSON.stringify(updated))
  }

  const handleNext = () => {
    if (isLast) {
      const answers = session.answers.map((a, i) => a ?? questions[i].choices[0])
      const score = answers.filter((a, i) => a === questions[i].correctAnswer).length
      const result: QuizResult = {
        genre: session.genre,
        difficulty: session.difficulty,
        questions,
        answers,
        score,
      }
      sessionStorage.setItem('quizResult', JSON.stringify(result))
      router.push('/result')
    } else {
      setSelected(null)
      setSession(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : prev)
    }
  }

  const getChoiceState = (choice: string) => {
    if (!isAnswered) return 'default'
    if (choice === question.correctAnswer) return 'correct'
    if (choice === selected) return 'wrong'
    return 'disabled'
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {GENRE_LABELS[session.genre]} / {DIFF_LABELS[session.difficulty]}
          </span>
          <span className="text-sm text-gray-400">第 {currentIndex + 1} 問</span>
        </div>

        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        <p className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
          {question.text}
        </p>

        <div className="flex flex-col gap-3">
          {question.choices.map((choice) => (
            <ChoiceButton
              key={choice}
              label={choice}
              state={getChoiceState(choice)}
              onClick={() => handleAnswer(choice)}
            />
          ))}
        </div>

        {isAnswered && (
          <AnswerFeedback
            isCorrect={isCorrect}
            explanation={question.explanation}
            onNext={handleNext}
            isLast={isLast}
          />
        )}
      </div>
    </main>
  )
}
