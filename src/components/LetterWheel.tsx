import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ShuffleIcon } from './icons'

interface LetterNode {
  id: number
  letter: string
}

interface LetterWheelProps {
  letters: string[]
  allowRepeatedNode: boolean
  disabled?: boolean
  onDraftChange: (word: string) => void
  onSubmit: (word: string) => void
}

const positionFor = (index: number, count: number) => {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  return { x: 50 + Math.cos(angle) * 36, y: 50 + Math.sin(angle) * 36 }
}

export function LetterWheel({ letters, allowRepeatedNode, disabled, onDraftChange, onSubmit }: LetterWheelProps) {
  const [nodes, setNodes] = useState<LetterNode[]>(() => letters.map((letter, id) => ({ letter, id })))
  const [selected, setSelected] = useState<number[]>([])
  const selectedRef = useRef<number[]>([])
  const pointerId = useRef<number | undefined>(undefined)
  const lastHovered = useRef<number | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const hitRefs = useRef(new Map<number, HTMLButtonElement>())

  useEffect(() => {
    setNodes(letters.map((letter, id) => ({ letter, id })))
    setSelected([])
    selectedRef.current = []
    onDraftChange('')
  }, [letters, onDraftChange])

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])

  const wordFor = (selection: number[]) => selection.map((id) => nodeById.get(id)?.letter ?? '').join('')

  const applySelection = (next: number[]) => {
    selectedRef.current = next
    setSelected(next)
    onDraftChange(wordFor(next))
  }

  const updateSelection = (id: number) => {
    const current = selectedRef.current
    if (current.length >= 2 && current[current.length - 2] === id) {
      applySelection(current.slice(0, -1))
      return
    }
    if (!allowRepeatedNode && current.includes(id)) return
    applySelection([...current, id])
  }

  const begin = (event: ReactPointerEvent, id: number) => {
    if (disabled) return
    event.preventDefault()
    pointerId.current = event.pointerId
    lastHovered.current = id
    wheelRef.current?.setPointerCapture(event.pointerId)
    applySelection([id])
  }

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== event.pointerId) return
    let hovered: number | null = null
    let closest = Number.POSITIVE_INFINITY
    hitRefs.current.forEach((element, id) => {
      const rect = element.getBoundingClientRect()
      const inside = event.clientX >= rect.left && event.clientX <= rect.right
        && event.clientY >= rect.top && event.clientY <= rect.bottom
      const distance = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2))
      if (inside && distance < closest) {
        hovered = id
        closest = distance
      }
    })
    if (hovered === null) {
      lastHovered.current = null
      return
    }
    if (hovered !== lastHovered.current) updateSelection(hovered)
    lastHovered.current = hovered
  }

  const finish = (event: ReactPointerEvent<HTMLDivElement>, submit: boolean) => {
    if (pointerId.current !== event.pointerId) return
    if (wheelRef.current?.hasPointerCapture(event.pointerId)) wheelRef.current.releasePointerCapture(event.pointerId)
    pointerId.current = undefined
    lastHovered.current = null
    const completedWord = wordFor(selectedRef.current)
    if (submit && completedWord) onSubmit(completedWord)
    applySelection([])
  }

  const shuffle = () => {
    setNodes((current) => {
      const next = [...current]
      for (let index = next.length - 1; index > 0; index -= 1) {
        const target = Math.floor(Math.random() * (index + 1))
        ;[next[index], next[target]] = [next[target], next[index]]
      }
      return next
    })
  }

  return (
    <div
      className={`letter-wheel${letters.length >= 8 ? ' letter-wheel--dense' : ''}${disabled ? ' is-disabled' : ''}`}
      ref={wheelRef}
      onPointerMove={move}
      onPointerUp={(event) => finish(event, true)}
      onPointerCancel={(event) => finish(event, false)}
      data-testid="letter-wheel"
    >
      <svg className="letter-wheel__lines" viewBox="0 0 100 100" aria-hidden="true">
        {selected.slice(1).map((id, index) => {
          const fromIndex = nodes.findIndex((node) => node.id === selected[index])
          const toIndex = nodes.findIndex((node) => node.id === id)
          const from = positionFor(fromIndex, nodes.length)
          const to = positionFor(toIndex, nodes.length)
          return <line key={`${index}-${id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        })}
      </svg>
      {nodes.map((node, index) => {
        const position = positionFor(index, nodes.length)
        return (
          <button
            className={`letter-node${selected.includes(node.id) ? ' is-selected' : ''}`}
            type="button"
            key={node.id}
            ref={(element) => {
              if (element) hitRefs.current.set(node.id, element)
              else hitRefs.current.delete(node.id)
            }}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onPointerDown={(event) => begin(event, node.id)}
            aria-label={`Kirjain ${node.letter}`}
            data-letter={node.letter}
          >
            <span className="letter-node__glyph">
              {node.letter}
            </span>
          </button>
        )
      })}
      <button className="shuffle-button" type="button" onClick={shuffle} aria-label="Sekoita kirjaimet" disabled={disabled}>
        <ShuffleIcon />
        <span>Sekoita</span>
      </button>
    </div>
  )
}
