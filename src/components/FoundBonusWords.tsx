import { useEffect, useMemo, useState } from 'react'
import { normalizeWord } from '../game/normalize'
import { CloseIcon, SparkIcon } from './icons'

interface FoundBonusWordsProps {
  words: string[]
  draft: string
}

export function FoundBonusWords({ words, draft }: FoundBonusWordsProps) {
  const [open, setOpen] = useState(false)
  const sortedWords = useMemo(() => [...words].sort((left, right) => left.localeCompare(right, 'fi')), [words])
  const normalizedDraft = normalizeWord(draft)
  const matchingWords = normalizedDraft ? sortedWords.filter((word) => word.startsWith(normalizedDraft)) : []
  const exactDuplicate = matchingWords.find((word) => word === normalizedDraft)
  const showMatches = matchingWords.length > 0
  const panelVisible = open || showMatches
  const shownWords = showMatches ? matchingWords : sortedWords
  const matchSummary = matchingWords.join(', ')

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <div className={`found-bonus${showMatches ? ' is-match' : ''}`}>
      <button
        className="found-bonus__toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={words.length === 0}
        aria-expanded={panelVisible}
        aria-label={exactDuplicate
          ? `Jo löydetty bonus-sana ${exactDuplicate}`
          : showMatches
            ? `Löydetty bonus-sana alkaa ${normalizedDraft}: ${matchSummary}`
            : `Näytä löydetyt bonussanat (${words.length})`}
      >
        <SparkIcon />
        <span>{showMatches ? 'Löydetty' : 'Bonus'}</span>
        <small>{showMatches ? `${normalizedDraft}${exactDuplicate ? '' : '…'}` : words.length}</small>
      </button>

      {panelVisible && (
        <section className="found-bonus__panel" role="region" aria-label="Löydetyt bonussanat" aria-live={showMatches ? 'polite' : undefined}>
          <header>
            <strong>{showMatches ? 'Löydetty bonus alkaa näin' : 'Löydetyt bonussanat'}</strong>
            {open && <button type="button" onClick={() => setOpen(false)} aria-label="Sulje löydetyt bonussanat"><CloseIcon /></button>}
          </header>
          <div className="found-bonus__list">
            {shownWords.map((word) => {
              const enteredLength = showMatches ? normalizedDraft.length : word.length
              const entered = word.slice(0, enteredLength)
              const remaining = word.slice(enteredLength)
              return (
                <span className="found-bonus__word" key={word} aria-label={showMatches ? `Löydetty bonus-sana ${word}, valittu alku ${entered}` : word}>
                  <b>{entered}</b><i>{remaining}</i>
                </span>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
