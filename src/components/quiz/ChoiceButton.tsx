'use client'

type State = 'default' | 'correct' | 'wrong' | 'disabled'

type Props = {
  label: string
  state: State
  onClick: () => void
}

const stateClasses: Record<State, string> = {
  default: 'bg-white border-gray-300 text-gray-800 hover:bg-blue-50 hover:border-blue-400 cursor-pointer',
  correct: 'bg-green-100 border-green-500 text-green-800 cursor-default',
  wrong: 'bg-red-100 border-red-400 text-red-700 cursor-default',
  disabled: 'bg-gray-100 border-gray-200 text-gray-400 cursor-default',
}

export function ChoiceButton({ label, state, onClick }: Props) {
  return (
    <button
      onClick={state === 'default' ? onClick : undefined}
      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors duration-150 font-medium ${stateClasses[state]}`}
    >
      {state === 'correct' && <span className="mr-2">✓</span>}
      {state === 'wrong' && <span className="mr-2">✗</span>}
      {label}
    </button>
  )
}
