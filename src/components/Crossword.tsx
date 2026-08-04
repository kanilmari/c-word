import { useMemo } from 'react'
import { buildGrid, visibleCellKeys } from '../game/grid'
import type { LevelData, LevelProgress } from '../types/game'

interface CrosswordProps {
  level: LevelData
  progress: LevelProgress
}

export function Crossword({ level, progress }: CrosswordProps) {
  const cells = useMemo(() => [...buildGrid(level).values()], [level])
  const visible = useMemo(
    () => visibleCellKeys(level, progress.solvedWords, progress.revealedCells),
    [level, progress.revealedCells, progress.solvedWords]
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
          return (
            <div
              className={`crossword__cell${isVisible ? ' is-visible' : ''}${wasHinted ? ' is-hinted' : ''}`}
              role="gridcell"
              data-testid={`cell-${cell.key}`}
              data-letter={isVisible ? cell.letter : ''}
              aria-label={isVisible ? cell.letter : 'Tyhjä kirjainruutu'}
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
