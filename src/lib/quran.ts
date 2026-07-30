export const MARAHIL = [
  { id: 1, name: 'Marhala 1', juz: [30] },
  { id: 2, name: 'Marhala 2', juz: [29, 28] },
  { id: 3, name: 'Marhala 3', juz: [27, 26] },
  { id: 4, name: 'Marhala 4', juz: [1, 2, 3, 4, 5] },
  { id: 5, name: 'Marhala 5', juz: [6, 7, 8, 9, 10] },
  { id: 6, name: 'Marhala 6', juz: [11, 12, 13, 14, 15] },
  { id: 7, name: 'Marhala 7', juz: [16, 17, 18, 19, 20] },
  { id: 8, name: 'Marhala 8', juz: [21, 22, 23, 24, 25] },
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

export function formatCompletedJuz(completedJuz: number[]): { marhala: string; juzList: string }[] {
  if (!completedJuz || completedJuz.length === 0) return []

  const result = []
  for (const m of MARAHIL) {
    const selectedInMarhala = m.juz.filter((j) => completedJuz.includes(j))
    if (selectedInMarhala.length > 0) {
      let juzList = ''
      if (m.id === 1) {
        juzList = `Juz ${selectedInMarhala[0]}`
      } else if (m.id === 2 || m.id === 3) {
        juzList = selectedInMarhala.map(j => `Juz ${j}`).join(' & ')
      } else {
        if (selectedInMarhala.length === m.juz.length) {
          juzList = `Juz ${Math.min(...m.juz)}–${Math.max(...m.juz)}`
        } else {
          // Sort ascending for range generation
          const sorted = [...selectedInMarhala].sort((a, b) => a - b)
          const ranges = []
          let start = sorted[0]
          let prev = start
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === prev + 1) {
              prev = sorted[i]
            } else {
              ranges.push(start === prev ? `Juz ${start}` : `Juz ${start}–${prev}`)
              start = sorted[i]
              prev = start
            }
          }
          ranges.push(start === prev ? `Juz ${start}` : `Juz ${start}–${prev}`)
          juzList = ranges.join(', ')
        }
      }
      
      result.push({
        marhala: m.name,
        juzList: juzList
      })
    }
  }
  return result
}
