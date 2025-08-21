import { type Player } from '../engine/player'
import { type Board, getRowForCard } from '../engine/board'
import { type Card } from '../engine/card'

export type SmartBot = {
  name: string
  difficulty: 'smart'
}

export type BotDecision = {
  card: Card
  chosenRow?: number
}

export const createSmartBot = (name: string): SmartBot => {
  return {
    name,
    difficulty: 'smart'
  }
}

export const selectCardForSmartBot = (bot: SmartBot, player: Player, board: Board): BotDecision => {
  if (player.hand.length === 0) {
    throw new Error('No cards in hand')
  }
  
  // Sort hand by card value (ascending)
  const sortedHand = [...player.hand].sort((a, b) => a.number - b.number)
  
  // If board is empty, just play lowest card
  const hasCards = board.some(row => row.length > 0)
  if (!hasCards) {
    return { card: sortedHand[0] }
  }
  
  // Find safe cards (won't cause penalties)
  const safeCards: Card[] = []
  const sixthCards: Card[] = []
  const tooLowCards: Card[] = []
  
  for (const card of sortedHand) {
    const targetRow = getRowForCard(board, card)
    
    if (targetRow === -1) {
      // Card is too low
      tooLowCards.push(card)
    } else {
      const row = board[targetRow]
      if (row.length === 5) {
        // Would be 6th card
        sixthCards.push(card)
      } else {
        // Safe to play
        safeCards.push(card)
      }
    }
  }
  
  // Strategy: Play lowest safe card
  if (safeCards.length > 0) {
    return { card: safeCards[0] } // Already sorted, so first is lowest
  }
  
  // No safe cards - need to take penalty
  // If we have cards that would be 6th, evaluate penalty
  if (sixthCards.length > 0) {
    // Find which 6th card would give minimum penalty
    let bestCard = sixthCards[0]
    let minPenalty = Infinity
    
    for (const card of sixthCards) {
      const targetRow = getRowForCard(board, card)
      const row = board[targetRow]
      const penalty = row.reduce((sum, c) => sum + c.bullHeads, 0)
      
      if (penalty < minPenalty) {
        minPenalty = penalty
        bestCard = card
      }
    }
    
    // Check if any too-low card would give less penalty
    if (tooLowCards.length > 0) {
      const lowestCard = tooLowCards[0]
      const minRowPenalty = Math.min(...board.map(row => 
        row.reduce((sum, c) => sum + c.bullHeads, 0)
      ))
      
      if (minRowPenalty < minPenalty) {
        // Taking a row is better than being 6th
        const bestRowIndex = board.findIndex(row => 
          row.reduce((sum, c) => sum + c.bullHeads, 0) === minRowPenalty
        )
        return { card: lowestCard, chosenRow: bestRowIndex }
      }
    }
    
    return { card: bestCard }
  }
  
  // Only too-low cards left - pick lowest and choose row with minimum penalty
  const lowestCard = tooLowCards[0]
  
  // Find row with minimum bull heads
  let minBullHeads = Infinity
  let bestRow = 0
  
  for (let i = 0; i < board.length; i++) {
    const row = board[i]
    const bullHeads = row.reduce((sum, c) => sum + c.bullHeads, 0)
    if (bullHeads < minBullHeads) {
      minBullHeads = bullHeads
      bestRow = i
    }
  }
  
  return {
    card: lowestCard,
    chosenRow: bestRow
  }
}