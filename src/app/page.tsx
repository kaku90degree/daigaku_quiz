'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Genre, Difficulty, QuizSession } from '@/types'
import { GenreSelector } from '@/components/quiz/GenreSelector'
import { DifficultySelector } from '@/components/quiz/DifficultySelector'
import { generateQuiz } from '@/lib/quiz-engine'
import { loadQuestions } from '@/lib/universities'

export default function HomePage() {
  const router = useRouter()
  const [genre, setGenre] = useState<Genre | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    if (!genre) return
    setLoading(true)
    setError(null)
    try {
      const allQuestions = await loadQuestions()
      const questions = generateQuiz(genre, difficulty, allQuestions)
      if (questions.length < 5) {
        setError('この難易度・ジャンルの問題が足りません。難易度を変えてお試しください。')
        return
      }
      const session: QuizSession = {
        genre,
        difficulty,
        questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
      }
      sessionStorage.setItem('quizSession', JSON.stringify(session))
      router.push('/quiz')
    } catch {
      setError('データの読み込みに失敗しました。ページをリロードしてください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">大学クイズ</h1>
        <p className="text-gray-500 text-sm mb-8">日本の大学に関する4択クイズ（全10問）</p>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">ジャンル</h2>
          <GenreSelector value={genre} onChange={setGenre} />
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">難易度</h2>
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </section>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={!genre || loading}
          className="w-full py-3 rounded-xl font-bold text-white text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
        >
          {loading ? '読み込み中...' : 'クイズを始める'}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/history')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            スコア履歴を見る
          </button>
        </div>
      </div>
    </main>
  )
}
