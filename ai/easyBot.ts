import { type Card } from '../engine/card'
import { type Board } from '../engine/board'
import { type Player } from '../engine/player'

export type BotDifficulty = 'easy' | 'medium' | 'hard'

export type Bot = {
  name: string
  difficulty: BotDifficulty
}

export type BotDecision = {
  card: Card
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


export const selectCardForBot = (bot: Bot, player: Player, board: Board): BotDecision => {
  if (player.hand.length === 0) {
    throw new Error('No cards in hand')
  }
  
  // Easy bot: pick a random card
  const selectedCard = getRandomElement(player.hand)
  
  return {
    card: selectedCard
  }
}