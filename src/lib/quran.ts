export const MARAHIL = [
  { id: 1, name: 'Marhala 1', juz: [30] },
  { id: 2, name: 'Marhala 2', juz: [29, 28] },
  { id: 3, name: 'Marhala 3', juz: [27, 26, 25] },
  { id: 4, name: 'Marhala 4', juz: [24, 23, 22, 21] },
  { id: 5, name: 'Marhala 5', juz: [20, 19, 18, 17, 16] },
  { id: 6, name: 'Marhala 6', juz: [15, 14, 13, 12, 11] },
  { id: 7, name: 'Marhala 7', juz: [10, 9, 8, 7, 6] },
  { id: 8, name: 'Marhala 8', juz: [5, 4, 3, 2, 1] },
]

export function getMarhalaStatus(completedJuz: number[]): { text: string; type: 'Not Started' | 'Pending' | 'Completed' } {
  if (!completedJuz || completedJuz.length === 0) return { text: 'Not Started', type: 'Not Started' }

  let highestComplete = 0
  let pendingMarhala = 0

  for (const m of MARAHIL) {
    const isComplete = m.juz.every((j) => completedJuz.includes(j))
    const isStarted = m.juz.some((j) => completedJuz.includes(j))

    if (isComplete) {
      highestComplete = m.id
    } else if (isStarted) {
      pendingMarhala = m.id
      break
    }
  }

  if (pendingMarhala > 0) {
    return { text: `Marhala ${pendingMarhala} Pending`, type: 'Pending' }
  } else if (highestComplete > 0) {
    return { text: `Marhala ${highestComplete} Complete`, type: 'Completed' }
  }

  return { text: 'Started', type: 'Pending' }
}
