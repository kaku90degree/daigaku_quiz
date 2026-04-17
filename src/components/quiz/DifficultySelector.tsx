'use client'

import type { Difficulty } from '@/types'

type Props = {
  value: Difficulty
  onChange: (d: Difficulty) => void
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: '易', desc: '旧帝大・早慶など' },
  { value: 'medium', label: '中', desc: '全国的に知られた大学' },
  { value: 'hard', label: '難', desc: '全大学対象' },
]

export function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-3">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.value}
          onClick={() => onChange(d.value)}
          className={`flex-1 rounded-xl border-2 p-3 text-center transition-colors ${
            value === d.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <p className="font-bold text-gray-800">{d.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
        </button>
      ))}
    </div>
  )
}
