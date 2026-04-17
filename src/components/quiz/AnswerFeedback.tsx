'use client'

type Props = {
  isCorrect: boolean
  explanation: string
  onNext: () => void
  isLast: boolean
}

export function AnswerFeedback({ isCorrect, explanation, onNext, isLast }: Props) {
  return (
    <div className={`rounded-lg p-4 mt-4 border-2 ${isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
      <p className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
        {isCorrect ? '正解！' : '不正解'}
      </p>
      <p className="text-gray-700 text-sm mb-4">{explanation}</p>
      <button
        onClick={onNext}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        {isLast ? '結果を見る' : '次の問題へ →'}
      </button>
    </div>
  )
}
