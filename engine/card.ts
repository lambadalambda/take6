export type Card = {
  readonly number: number
  readonly bullHeads: number
}

export const isValidCardNumber = (number: number): boolean => {
  return number >= 1 && number <= 104
}

export const calculateBullHeads = (number: number): number => {
  if (number === 55) return 7
  if (number % 11 === 0) return 5
  if (number % 10 === 0) return 3
  if (number % 5 === 0) return 2
  return 1
}

export const createCard = (number: number): Card => {
  if (!isValidCardNumber(number)) {
    throw new Error('Card number must be between 1 and 104')
  }
  
  return {
    number,
    bullHeads: calculateBullHeads(number)
  }
}

export const compareCards = (a: Card, b: Card): number => {
  return a.number - b.number
}

export const canPlaceAfter = (card: Card, afterCard: Card): boolean => {
  return card.number > afterCard.number
}

export const cardToString = (card: Card): string => {
  const headText = card.bullHeads === 1 ? 'bull head' : 'bull heads'
  return `Card ${card.number} (${card.bullHeads} ${headText})`
}