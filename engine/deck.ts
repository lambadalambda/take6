import { type Card, createCard } from './card'

export type Deck = Card[]

export const createDeck = (): Deck => {
  const deck: Deck = []
  for (let i = 1; i <= 104; i++) {
    deck.push(createCard(i))
  }
  return deck
}

export const isDeckValid = (deck: Deck): boolean => {
  if (deck.length !== 104) return false
  
  const numbers = new Set(deck.map(card => card.number))
  if (numbers.size !== 104) return false
  
  for (let i = 1; i <= 104; i++) {
    if (!numbers.has(i)) return false
  }
  
  return true
}

export const shuffleDeck = (deck: Deck): Deck => {
  const shuffled = [...deck]
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export const dealCards = (deck: Deck, numPlayers: number, cardsPerPlayer: number): Card[][] => {
  if (numPlayers <= 0) {
    throw new Error('Invalid number of players')
  }
  
  if (cardsPerPlayer <= 0) {
    throw new Error('Invalid cards per player')
  }
  
  const totalCardsNeeded = numPlayers * cardsPerPlayer
  if (deck.length < totalCardsNeeded) {
    throw new Error('Not enough cards in deck')
  }
  
  const hands: Card[][] = Array.from({ length: numPlayers }, () => [])
  
  // Deal cards in round-robin fashion
  for (let cardIndex = 0; cardIndex < totalCardsNeeded; cardIndex++) {
    const playerIndex = cardIndex % numPlayers
    hands[playerIndex].push(deck[cardIndex])
  }
  
  return hands
}