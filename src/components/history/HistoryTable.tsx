'use client'

import type { ScoreRecord, Genre, Difficulty } from '@/types'

const GENRE_LABELS: Record<Genre, string> = {
  'owner-type': '設置者区分',
  faculty: '設置学部',
  'founded-year': '設立年',
}

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: '易',
  medium: '中',
  hard: '難',
}

type Props = {
  records: ScoreRecord[]
  onClear: () => void
}

export function HistoryTable({ records, onClear }: Props) {
  if (records.length === 0) {
    return <p className="text-center text-gray-500 py-12">まだ記録がありません。</p>
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-2 pr-4">日時</th>
              <th className="text-left py-2 pr-4">ジャンル</th>
              <th className="text-left py-2 pr-4">難易度</th>
              <th className="text-right py-2">スコア</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-500">
                  {new Date(r.playedAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2 pr-4">{GENRE_LABELS[r.genre]}</td>
                <td className="py-2 pr-4">{DIFF_LABELS[r.difficulty]}</td>
                <td className="py-2 text-right font-semibold">
                  {r.score}/{r.total}
                  <span className="text-gray-400 font-normal ml-1">
                    ({Math.round((r.score / r.total) * 100)}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-700 underline"
        >
          履歴を削除
        </button>
      </div>
    </div>
  )
}
