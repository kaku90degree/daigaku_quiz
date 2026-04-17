'use client'

type Props = {
  score: number
  total: number
}

export function ScoreDisplay({ score, total }: Props) {
  const pct = Math.round((score / total) * 100)

  const message =
    pct === 100 ? '完璧！満点です！' :
    pct >= 80 ? 'すごい！高得点です！' :
    pct >= 60 ? 'なかなか良い成績！' :
    pct >= 40 ? 'もう少し！再挑戦してみよう' :
    '大学の知識を深めよう！'

  return (
    <div className="text-center py-8">
      <p className="text-6xl font-bold text-blue-600 mb-2">{score}<span className="text-3xl text-gray-400"> / {total}</span></p>
      <p className="text-2xl text-gray-600 mb-3">正答率 {pct}%</p>
      <p className="text-lg text-gray-700 font-medium">{message}</p>
    </div>
  )
}
