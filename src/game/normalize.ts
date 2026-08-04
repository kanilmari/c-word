export function normalizeWord(value: string): string {
  return value.trim().toLocaleUpperCase('fi-FI')
}

export function letterCounts(letters: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const rawLetter of letters) {
    const letter = normalizeWord(rawLetter)
    counts.set(letter, (counts.get(letter) ?? 0) + 1)
  }
  return counts
}

export function canBuildWord(word: string, letters: readonly string[]): boolean {
  const available = letterCounts(letters)
  for (const letter of [...normalizeWord(word)]) {
    const left = available.get(letter) ?? 0
    if (left === 0) return false
    available.set(letter, left - 1)
  }
  return true
}
