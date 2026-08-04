import type { ActionFeedback } from '../hooks/useGame'

interface GuessDisplayProps {
  draft: string
  feedback?: ActionFeedback
}

const labels: Record<ActionFeedback['kind'], string> = {
  crossword: 'Oikein!',
  bonus: 'Bonus-sana +1',
  duplicate: 'Löysit tämän jo',
  invalid: 'Kokeile toista sanaa',
  hint: 'Vihje avattu'
}

export function GuessDisplay({ draft, feedback }: GuessDisplayProps) {
  const shown = draft || feedback?.word || ''
  return (
    <div className={`guess-display ${feedback && !draft ? `guess-display--${feedback.kind}` : ''}`} key={draft ? 'draft' : feedback?.id} aria-live="polite">
      <span className="guess-display__word">{shown || 'Muodosta sana'}</span>
      {!draft && feedback && <small>{labels[feedback.kind]}</small>}
    </div>
  )
}
