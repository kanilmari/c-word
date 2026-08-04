import { useEffect, useMemo, useState } from 'react'

interface LimitedKeyboardProps {
  letters: string[]
  disabled?: boolean
  onDraftChange: (word: string) => void
  onSubmit: (word: string) => void
}

export function LimitedKeyboard({ letters, disabled, onDraftChange, onSubmit }: LimitedKeyboardProps) {
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
        {slots.map(({ id, letter }) => (
          <button
            type="button"
            key={id}
            disabled={disabled || selected.includes(id)}
            className={selected.includes(id) ? 'is-used' : ''}
            onClick={() => change([...selected, id])}
            data-testid={`key-${letter}-${id}`}
            aria-label={`Lisää kirjain ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="limited-keyboard__actions">
        <button type="button" onClick={() => change(selected.slice(0, -1))} disabled={disabled || selected.length === 0}>Poista</button>
        <button type="button" onClick={() => change([])} disabled={disabled || selected.length === 0}>Tyhjennä</button>
        <button className="primary-action" type="button" onClick={submit} disabled={disabled || !draft}>Hyväksy</button>
      </div>
    </div>
  )
}
