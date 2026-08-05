import type { GridCell, LevelData, LevelWord } from '../types/game'
import { normalizeWord } from './normalize'

export const cellKey = (row: number, column: number) => `${row}:${column}`

export function cellsForWord(word: LevelWord): Array<{ key: string; row: number; column: number; letter: string }> {
  return [...word.answer].map((letter, index) => {
    const row = word.row + (word.direction === 'vertical' ? index : 0)
    const column = word.column + (word.direction === 'horizontal' ? index : 0)
    return { key: cellKey(row, column), row, column, letter }
  })
}

export function buildGrid(level: LevelData): Map<string, GridCell> {
  const grid = new Map<string, GridCell>()
  for (const word of level.words) {
    for (const position of cellsForWord(word)) {
      const existing = grid.get(position.key)
      if (existing) {
        if (!existing.words.includes(word.answer)) existing.words.push(word.answer)
      } else {
        grid.set(position.key, { ...position, words: [word.answer] })
      }
    }
  }
  return grid
}

export function visibleCellKeys(level: LevelData, solvedWords: readonly string[], revealedCells: readonly string[]): Set<string> {
  const visible = new Set(revealedCells)
  for (const word of level.words) {
    if (solvedWords.includes(word.answer)) {
      cellsForWord(word).forEach(({ key }) => visible.add(key))
    }
  }
  return visible
}

export type DraftMatch = 'prefix' | 'word'

export function draftMatchCells(
  level: LevelData,
  solvedWords: readonly string[],
  revealedCells: readonly string[],
  draft: string
): Map<string, DraftMatch> {
  const matches = new Map<string, DraftMatch>()
  const normalizedDraft = normalizeWord(draft)
  if (!normalizedDraft) return matches
  const visible = visibleCellKeys(level, solvedWords, revealedCells)

  level.words.forEach((word) => {
    if (!word.answer.startsWith(normalizedDraft)) return
    const match: DraftMatch = solvedWords.includes(word.answer) && word.answer === normalizedDraft ? 'word' : 'prefix'
    cellsForWord(word).slice(0, normalizedDraft.length).forEach(({ key }) => {
      if (!visible.has(key)) return
      if (match === 'word' || !matches.has(key)) matches.set(key, match)
    })
  })
  return matches
}
