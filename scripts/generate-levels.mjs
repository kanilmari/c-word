import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(projectRoot, 'data', 'nykysuomensanalista2024.txt')
const seedsPath = join(projectRoot, 'src', 'data', 'levelSeeds.json')
const outputPath = join(projectRoot, 'src', 'data', 'levels.json')
const finnishWordPattern = /^[a-zåäö]+$/u

function normalizeWord(value) {
  return value.trim().toLocaleUpperCase('fi-FI')
}

function letterCounts(letters) {
  const counts = new Map()
  for (const letter of letters) counts.set(letter, (counts.get(letter) ?? 0) + 1)
  return counts
}

function canBuildWord(word, letters) {
  const available = letterCounts(letters)
  for (const letter of word) {
    const remaining = available.get(letter) ?? 0
    if (remaining === 0) return false
    available.set(letter, remaining - 1)
  }
  return true
}

function cellsFor(answer, row, column, direction) {
  return [...answer].map((letter, index) => ({
    row: row + (direction === 'vertical' ? index : 0),
    column: column + (direction === 'horizontal' ? index : 0),
    letter
  }))
}

function keyFor(row, column) {
  return `${row}:${column}`
}

function buildOccupancy(placements) {
  const occupied = new Map()
  for (const placement of placements) {
    for (const cell of cellsFor(placement.answer, placement.row, placement.column, placement.direction)) {
      const key = keyFor(cell.row, cell.column)
      const current = occupied.get(key)
      if (current) current.directions.add(placement.direction)
      else occupied.set(key, { ...cell, directions: new Set([placement.direction]) })
    }
  }
  return occupied
}

function layoutBounds(placements) {
  const cells = placements.flatMap((placement) => cellsFor(placement.answer, placement.row, placement.column, placement.direction))
  return {
    minRow: Math.min(...cells.map(({ row }) => row)),
    maxRow: Math.max(...cells.map(({ row }) => row)),
    minColumn: Math.min(...cells.map(({ column }) => column)),
    maxColumn: Math.max(...cells.map(({ column }) => column))
  }
}

function placementCandidates(answer, placements) {
  const occupied = buildOccupancy(placements)
  const candidates = new Map()

  for (let index = 0; index < answer.length; index += 1) {
    const letter = answer[index]
    for (const existing of occupied.values()) {
      if (existing.letter !== letter) continue
      for (const direction of ['horizontal', 'vertical']) {
        if (existing.directions.has(direction)) continue
        const row = existing.row - (direction === 'vertical' ? index : 0)
        const column = existing.column - (direction === 'horizontal' ? index : 0)
        const candidateKey = `${row}:${column}:${direction}`
        if (candidates.has(candidateKey)) continue

        const cells = cellsFor(answer, row, column, direction)
        const before = direction === 'horizontal' ? keyFor(row, column - 1) : keyFor(row - 1, column)
        const afterCell = cells[cells.length - 1]
        const after = direction === 'horizontal'
          ? keyFor(afterCell.row, afterCell.column + 1)
          : keyFor(afterCell.row + 1, afterCell.column)
        if (occupied.has(before) || occupied.has(after)) continue

        let crossings = 0
        let valid = true
        for (const cell of cells) {
          const current = occupied.get(keyFor(cell.row, cell.column))
          if (current) {
            if (current.letter !== cell.letter || current.directions.has(direction)) {
              valid = false
              break
            }
            crossings += 1
            continue
          }
          const perpendicularNeighbors = direction === 'horizontal'
            ? [keyFor(cell.row - 1, cell.column), keyFor(cell.row + 1, cell.column)]
            : [keyFor(cell.row, cell.column - 1), keyFor(cell.row, cell.column + 1)]
          if (perpendicularNeighbors.some((key) => occupied.has(key))) {
            valid = false
            break
          }
        }
        if (!valid || crossings === 0) continue

        const nextPlacements = [...placements, { answer, row, column, direction }]
        const bounds = layoutBounds(nextPlacements)
        const rows = bounds.maxRow - bounds.minRow + 1
        const columns = bounds.maxColumn - bounds.minColumn + 1
        const area = rows * columns
        const score = crossings * 10_000 - area * 25 - Math.abs(rows - columns) * 350 - Math.max(rows, columns) * 30 + answer.length * 20
        candidates.set(candidateKey, { answer, row, column, direction, score })
      }
    }
  }

  return [...candidates.values()].sort((left, right) => right.score - left.score || left.answer.localeCompare(right.answer, 'fi'))
}

function growLayout(words, firstWord, targetWordCount, choiceOffset) {
  const placements = [{ answer: firstWord, row: 0, column: 0, direction: 'horizontal' }]
  const remaining = new Set(words.filter((word) => word !== firstWord))

  while (remaining.size > 0 && placements.length < targetWordCount) {
    const options = [...remaining]
      .flatMap((answer) => placementCandidates(answer, placements))
      .sort((left, right) => right.score - left.score || right.answer.length - left.answer.length || left.answer.localeCompare(right.answer, 'fi'))
    if (options.length === 0) break
    const selected = options[Math.min(choiceOffset, options.length - 1)]
    placements.push({ answer: selected.answer, row: selected.row, column: selected.column, direction: selected.direction })
    remaining.delete(selected.answer)
  }

  return placements
}

function normalizeLayout(placements) {
  const bounds = layoutBounds(placements)
  const words = placements.map((placement) => ({
    ...placement,
    row: placement.row - bounds.minRow,
    column: placement.column - bounds.minColumn
  }))
  return {
    words,
    grid: {
      rows: bounds.maxRow - bounds.minRow + 1,
      columns: bounds.maxColumn - bounds.minColumn + 1
    }
  }
}

function generateBestLayout(words, targetWordCount) {
  const sorted = [...new Set(words)].sort((left, right) => right.length - left.length || left.localeCompare(right, 'fi'))
  const attempts = []
  for (const firstWord of sorted) {
    for (let choiceOffset = 0; choiceOffset < Math.min(8, sorted.length); choiceOffset += 1) {
      attempts.push(growLayout(sorted, firstWord, targetWordCount, choiceOffset))
    }
  }

  attempts.sort((left, right) => {
    if (right.length !== left.length) return right.length - left.length
    const leftBounds = layoutBounds(left)
    const rightBounds = layoutBounds(right)
    const leftRows = leftBounds.maxRow - leftBounds.minRow + 1
    const leftColumns = leftBounds.maxColumn - leftBounds.minColumn + 1
    const rightRows = rightBounds.maxRow - rightBounds.minRow + 1
    const rightColumns = rightBounds.maxColumn - rightBounds.minColumn + 1
    const leftPenalty = leftRows * leftColumns + Math.abs(leftRows - leftColumns) * 100 + Math.max(leftRows, leftColumns) * 10
    const rightPenalty = rightRows * rightColumns + Math.abs(rightRows - rightColumns) * 100 + Math.max(rightRows, rightColumns) * 10
    return leftPenalty - rightPenalty
  })

  const best = attempts[0]
  if (!best || best.length < targetWordCount) {
    throw new Error(`Ristikkogeneraattori sijoitti vain ${best?.length ?? 0}/${targetWordCount} sanaa.`)
  }
  return normalizeLayout(best)
}

const [rawSource, rawSeeds] = await Promise.all([
  readFile(sourcePath, 'utf8'),
  readFile(seedsPath, 'utf8')
])

const dictionary = [...new Set(rawSource
  .split(/\r?\n/u)
  .slice(1)
  .map((line) => line.split('\t', 1)[0])
  .filter((word) => word === word.toLocaleLowerCase('fi-FI') && finnishWordPattern.test(word))
  .map(normalizeWord)
  .filter((word) => [...word].length >= 2))]
  .sort((left, right) => left.localeCompare(right, 'fi'))
const dictionarySet = new Set(dictionary)
const seeds = JSON.parse(rawSeeds)

const levels = seeds.map((seed) => {
  const letters = seed.letters.map(normalizeWord)
  const crosswordCandidates = seed.crosswordCandidates.map(normalizeWord)
  for (const word of crosswordCandidates) {
    if (!dictionarySet.has(word)) throw new Error(`${seed.id}: ${word} ei löydy Kotuksen sanalistasta.`)
    if (!canBuildWord(word, letters)) throw new Error(`${seed.id}: ${word} ei muodostu kentän kirjaimista.`)
  }

  const layout = generateBestLayout(crosswordCandidates, seed.targetWordCount)
  const crosswordAnswers = new Set(layout.words.map(({ answer }) => answer))
  const bonusWords = dictionary
    .filter((word) => word.length <= letters.length && canBuildWord(word, letters) && !crosswordAnswers.has(word))
    .sort((left, right) => left.length - right.length || left.localeCompare(right, 'fi'))

  return {
    id: seed.id,
    title: seed.title,
    place: seed.place,
    letters,
    grid: layout.grid,
    words: layout.words,
    bonusWords,
    hintCost: seed.hintCost ?? 100,
    allowRepeatedLetterNode: false
  }
})

await writeFile(outputPath, `${JSON.stringify(levels, null, 2)}\n`, 'utf8')
for (const level of levels) {
  console.log(`${level.id}: ${level.words.length} ristikkosanaa, ${level.bonusWords.length} bonus-sanaa, ${level.grid.rows}×${level.grid.columns}`)
}
