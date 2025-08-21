import { type Card } from './card'

export type Player = {
  name: string
  index: number
  hand: Card[]
  penaltyCards: Card[]
  selectedCard: Card | null
}

export type PlayerAction = {
  playerIndex: number
  card: Card
  chosenRow?: number
}

export const createPlayer = (name: string, index: number): Player => {
  return {
    name,
    index,
    hand: [],
    penaltyCards: [],
    selectedCard: null
  }
}

export const hasCard = (player: Player, card: Card): boolean => {
  return player.hand.some(c => c.number === card.number)
}

export const canSelectCard = (player: Player, card: Card): boolean => {
  return player.selectedCard === null && hasCard(player, card)
}

export const addToHand = (player: Player, cards: Card[]): Player => {
  return {
    ...player,
    hand: [...player.hand, ...cards]
  }
}

export const removeFromHand = (player: Player, card: Card): Player => {
  const cardIndex = player.hand.findIndex(c => c.number === card.number)
  
  if (cardIndex === -1) {
    throw new Error('Card not in hand')
  }
  
  const newHand = [...player.hand]
  newHand.splice(cardIndex, 1)
  
  return {
    ...player,
    hand: newHand
  }
}

export const selectCard = (player: Player, card: Card): Player => {
  if (player.selectedCard !== null) {
    throw new Error('Card already selected')
  }
  
  if (!hasCard(player, card)) {
    throw new Error('Cannot select card not in hand')
  }
  
  return {
    ...removeFromHand(player, card),
    selectedCard: card
  }
}

export const addPenaltyCards = (player: Player, cards: Card[]): Player => {
  return {
    ...player,
    penaltyCards: [...player.penaltyCards, ...cards]
  }
}

export const calculateScore = (player: Player): number => {
  return player.penaltyCards.reduce((total, card) => total + card.bullHeads, 0)
}