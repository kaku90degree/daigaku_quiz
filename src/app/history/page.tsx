'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ScoreRecord } from '@/types'
import { HistoryTable } from '@/components/history/HistoryTable'
import { loadHistory, clearHistory } from '@/lib/score-history'

export default function HistoryPage() {
  const router = useRouter()
  const [records, setRecords] = useState<ScoreRecord[]>([])

  useEffect(() => {
    setRecords(loadHistory())
  }, [])

  const handleClear = () => {
    if (!confirm('履歴をすべて削除しますか？')) return
    clearHistory()
    setRecords([])
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">スコア履歴</h1>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← トップへ
          </button>
        </div>

        <HistoryTable records={records} onClear={handleClear} />
      </div>
    </main>
  )
}
