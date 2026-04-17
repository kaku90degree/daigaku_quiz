'use client'

import type { Genre } from '@/types'

type Props = {
  value: Genre | null
  onChange: (genre: Genre) => void
}

const GENRES: { value: Genre; label: string; desc: string }[] = [
  { value: 'owner-type', label: '設置者区分', desc: '国立・公立・私立どれ？' },
  { value: 'faculty', label: '設置学部', desc: 'ない学部はどれ？' },
  { value: 'founded-year', label: '設立年', desc: 'いつ設立された？' },
]

export function GenreSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {GENRES.map((g) => (
        <button
          key={g.value}
          onClick={() => onChange(g.value)}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            value === g.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <p className="font-bold text-gray-800">{g.label}</p>
          <p className="text-sm text-gray-500 mt-1">{g.desc}</p>
        </button>
      ))}
    </div>
  )
}
