'use client'

import { useState } from 'react'
import type { Genre, Difficulty } from '@/types'
import { buildShareText, shareToX, shareToLine, copyToClipboard } from '@/lib/share'

type Props = {
  genre: Genre
  difficulty: Difficulty
  score: number
  total: number
}

export function ShareButtons({ genre, difficulty, score, total }: Props) {
  const [copied, setCopied] = useState(false)
  const text = buildShareText(genre, difficulty, score, total)

  const handleCopy = async () => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 text-center mb-3">結果をシェアする</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => shareToX(text)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          X でシェア
        </button>
        <button
          onClick={() => shareToLine(text)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
        >
          LINE
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          {copied ? 'コピー済み ✓' : 'コピー'}
        </button>
      </div>
    </div>
  )
}
