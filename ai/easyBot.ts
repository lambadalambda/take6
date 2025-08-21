import { type Card } from '../engine/card'
import { type Board, getRowForCard } from '../engine/board'
import { type Player } from '../engine/player'

export type BotDifficulty = 'easy' | 'medium' | 'hard'

export type Bot = {
  name: string
  difficulty: BotDifficulty
}

export type BotDecision = {
  card: Card
  chosenRow?: number
}

export const createEasyBot = (name: string): Bot => {
  return {
    name,
    difficulty: 'easy'
  }
}

// Helper function to get random element from array
const getRandomElement = <T>(array: T[]): T => {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array')
  }
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export const selectRowForBot = (bot: Bot, card: Card, board: Board): number => {
  // Easy bot just picks a random row (0-3)
  return Math.floor(Math.random() * 4)
}

export const selectCardForBot = (bot: Bot, player: Player, board: Board): BotDecision => {
  if (player.hand.length === 0) {
    throw new Error('No cards in hand')
  }
  
  // Easy bot: pick a random card
  const selectedCard = getRandomElement(player.hand)
  
  // Check if this card is too low for any row
  const targetRow = board.length > 0 ? getRowForCard(board, selectedCard) : 0
  const needsRowChoice = board.length > 0 && targetRow === -1
  
  return {
    card: selectedCard,
    chosenRow: needsRowChoice ? selectRowForBot(bot, selectedCard, board) : undefined
  }
}