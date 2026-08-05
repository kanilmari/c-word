import { useMemo } from 'react'
import { buildGrid, draftMatchCells, visibleCellKeys } from '../game/grid'
import type { LevelData, LevelProgress } from '../types/game'

interface CrosswordProps {
  level: LevelData
  progress: LevelProgress
  draft: string
}

export function Crossword({ level, progress, draft }: CrosswordProps) {
  const cells = useMemo(() => [...buildGrid(level).values()], [level])
  const visible = useMemo(
    () => visibleCellKeys(level, progress.solvedWords, progress.revealedCells),
    [level, progress.revealedCells, progress.solvedWords]
  )
  const draftMatches = useMemo(
    () => draftMatchCells(level, progress.solvedWords, progress.revealedCells, draft),
    [draft, level, progress.revealedCells, progress.solvedWords]
  )

  return (
    <div className="crossword-wrap">
      <div
        className="crossword"
        role="grid"
        aria-label={`Sanaristikko, ${progress.solvedWords.length} / ${level.words.length} sanaa ratkaistu`}
        style={{
          gridTemplateColumns: `repeat(${level.grid.columns}, 1fr)`,
          gridTemplateRows: `repeat(${level.grid.rows}, 1fr)`,
          '--grid-columns': level.grid.columns,
          '--grid-rows': level.grid.rows
        } as React.CSSProperties}
      >
        {cells.map((cell) => {
          const isVisible = visible.has(cell.key)
          const wasHinted = progress.revealedCells.includes(cell.key)
          const draftMatch = draftMatches.get(cell.key)
          const matchLabel = draftMatch === 'word' ? 'Valmis sanaehdotus' : draftMatch === 'prefix' ? 'Sanaehdotuksen alku' : undefined
          return (
            <div
              className={`crossword__cell${isVisible ? ' is-visible' : ''}${wasHinted ? ' is-hinted' : ''}${draftMatch ? ` is-draft-${draftMatch}` : ''}`}
              role="gridcell"
              data-testid={`cell-${cell.key}`}
              data-letter={isVisible ? cell.letter : ''}
              data-draft-match={draftMatch}
              aria-label={[isVisible ? cell.letter : 'Tyhjä kirjainruutu', matchLabel].filter(Boolean).join(', ')}
              key={cell.key}
              style={{ gridRow: cell.row + 1, gridColumn: cell.column + 1 }}
            >
              <span>{isVisible ? cell.letter : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
