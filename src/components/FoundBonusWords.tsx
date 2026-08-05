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
  const duplicateDraft = normalizedDraft && words.includes(normalizedDraft) ? normalizedDraft : undefined

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <div className={`found-bonus${duplicateDraft ? ' is-duplicate' : ''}`}>
      <button
        className="found-bonus__toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={words.length === 0}
        aria-expanded={open}
        aria-label={duplicateDraft ? `Jo löydetty bonus-sana ${duplicateDraft}` : `Näytä löydetyt bonussanat (${words.length})`}
      >
        <SparkIcon />
        <span>{duplicateDraft ? 'Löydetty' : 'Bonus'}</span>
        <small>{duplicateDraft ?? words.length}</small>
      </button>

      {open && (
        <section className="found-bonus__panel" role="dialog" aria-label="Löydetyt bonussanat">
          <header>
            <strong>Löydetyt bonussanat</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Sulje löydetyt bonussanat"><CloseIcon /></button>
          </header>
          <div className="found-bonus__list">
            {sortedWords.map((word) => <span className={word === duplicateDraft ? 'is-current' : ''} key={word}>{word}</span>)}
          </div>
        </section>
      )}
    </div>
  )
}
