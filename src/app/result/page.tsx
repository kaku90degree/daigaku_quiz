'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizResult } from '@/types'
import { ScoreDisplay } from '@/components/result/ScoreDisplay'
import { ShareButtons } from '@/components/result/ShareButtons'
import { saveScore } from '@/lib/score-history'

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('quizResult')
    if (!raw) { router.replace('/'); return }
    const r: QuizResult = JSON.parse(raw)
    setResult(r)
    saveScore(r.genre, r.difficulty, r.score, r.questions.length)
  }, [router])

  if (!result) return null

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">結果</h1>

        <ScoreDisplay score={result.score} total={result.questions.length} />

        <ShareButtons
          genre={result.genre}
          difficulty={result.difficulty}
          score={result.score}
          total={result.questions.length}
        />

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => {
              const raw = sessionStorage.getItem('quizResult')
              if (!raw) return
              const r: QuizResult = JSON.parse(raw)
              sessionStorage.removeItem('quizResult')
              sessionStorage.removeItem('quizSession')
              // 同じ設定で再挑戦するためにトップへ
              router.push(`/?genre=${r.genre}&difficulty=${r.difficulty}`)
            }}
            className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            もう一度同じ設定で挑戦
          </button>
          <button
            onClick={() => { sessionStorage.clear(); router.push('/') }}
            className="w-full py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ジャンル・難易度を変える
          </button>
          <button
            onClick={() => router.push('/history')}
            className="text-sm text-gray-500 hover:text-gray-700 underline text-center"
          >
            スコア履歴を見る
          </button>
        </div>
      </div>
    </main>
  )
}
