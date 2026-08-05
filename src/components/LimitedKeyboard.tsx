import { useEffect, useMemo, useState } from 'react'

interface LimitedKeyboardProps {
  letters: string[]
  completedInitials: ReadonlySet<string>
  disabled?: boolean
  onDraftChange: (word: string) => void
  onSubmit: (word: string) => void
}

export function LimitedKeyboard({ letters, completedInitials, disabled, onDraftChange, onSubmit }: LimitedKeyboardProps) {
  const slots = useMemo(() => letters.map((letter, id) => ({ letter, id })), [letters])
  const [selected, setSelected] = useState<number[]>([])
  const draft = selected.map((id) => slots[id].letter).join('')

  useEffect(() => {
    setSelected([])
    onDraftChange('')
  }, [letters, onDraftChange])

  const change = (next: number[]) => {
    setSelected(next)
    onDraftChange(next.map((id) => slots[id].letter).join(''))
  }

  const submit = () => {
    if (!draft || disabled) return
    onSubmit(draft)
    change([])
  }

  return (
    <div className={`limited-keyboard${disabled ? ' is-disabled' : ''}`} data-testid="limited-keyboard">
      <div className="limited-keyboard__letters">
        {slots.map(({ id, letter }) => {
          const initialComplete = completedInitials.has(letter)
          return (
            <button
              type="button"
              key={id}
              disabled={disabled || selected.includes(id)}
              className={`${initialComplete ? 'is-crossword-initial-complete' : ''}${selected.includes(id) ? ' is-used' : ''}`}
              onClick={() => change([...selected, id])}
              data-testid={`key-${letter}-${id}`}
              data-crossword-initial-complete={initialComplete || undefined}
              aria-label={`Lisää kirjain ${letter}${initialComplete ? ', kaikki tällä kirjaimella alkavat ristikkosanat ratkaistu' : ''}`}
            >
              {letter}
            </button>
          )
        })}
      </div>
      <div className="limited-keyboard__actions">
        <button type="button" onClick={() => change(selected.slice(0, -1))} disabled={disabled || selected.length === 0}>Poista</button>
        <button type="button" onClick={() => change([])} disabled={disabled || selected.length === 0}>Tyhjennä</button>
        <button className="primary-action" type="button" onClick={submit} disabled={disabled || !draft}>Hyväksy</button>
      </div>
    </div>
  )
}
