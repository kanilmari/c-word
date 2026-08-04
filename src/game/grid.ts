import type { GridCell, LevelData, LevelWord } from '../types/game'

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
