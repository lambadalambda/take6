import { type Card, compareCards } from './card'

export type Row = Card[]
export type Board = Row[]

export type PlacementResult = {
  board: Board
  takenCards: Card[]
}

export type CardPlacement = {
  card: Card
  playerIndex: number
  chosenRow?: number // For when card is too low
}

export type ProcessedPlacement = {
  card: Card
  playerIndex: number
  rowIndex: number
  takenCards: Card[]
  newBoard: Board
}

export type StepResult = {
  board: Board
  takenCards: Card[]
  rowIndex: number
  needsRowSelection: boolean
}

const MAX_CARDS_PER_ROW = 5

export const createBoard = (startingCards: Card[]): Board => {
  if (startingCards.length !== 4) {
    throw new Error('Must have exactly 4 starting cards')
  }
  
  return startingCards.map(card => [card])
}

export const getRowCards = (board: Board, rowIndex: number): Card[] => {
  return board[rowIndex] || []
}

export const isRowFull = (board: Board, rowIndex: number): boolean => {
  const row = getRowCards(board, rowIndex)
  return row.length >= MAX_CARDS_PER_ROW
}

export const getRowForCard = (board: Board, card: Card): number => {
  let bestRow = -1
  let bestLastCard: Card | null = null
  
  for (let i = 0; i < board.length; i++) {
    const row = board[i]
    const lastCard = row[row.length - 1]
    
    // Card must be higher than the last card in the row
    if (card.number > lastCard.number) {
      // Find the row with the closest (highest) last card
      if (bestLastCard === null || lastCard.number > bestLastCard.number) {
        bestRow = i
        bestLastCard = lastCard
      }
    }
  }
  
  return bestRow
}

export const canPlaceInRow = (board: Board, rowIndex: number, card: Card): boolean => {
  const row = getRowCards(board, rowIndex)
  
  if (row.length === 0) return false
  if (isRowFull(board, rowIndex)) return false
  
  const lastCard = row[row.length - 1]
  return card.number > lastCard.number
}

export const placeCard = (board: Board, rowIndex: number, card: Card): PlacementResult => {
  const newBoard = board.map(row => [...row])
  const row = newBoard[rowIndex]
  
  // Check if this would be the 6th card
  if (row.length >= MAX_CARDS_PER_ROW) {
    const takenCards = [...row]
    newBoard[rowIndex] = [card]
    return { board: newBoard, takenCards }
  }
  
  // Normal placement
  newBoard[rowIndex] = [...row, card]
  return { board: newBoard, takenCards: [] }
}

export const takeRow = (board: Board, rowIndex: number, card: Card): PlacementResult => {
  const newBoard = board.map(row => [...row])
  const takenCards = [...newBoard[rowIndex]]
  newBoard[rowIndex] = [card]
  
  return { board: newBoard, takenCards }
}

export const processCardPlacements = (board: Board, placements: CardPlacement[]): ProcessedPlacement[] => {
  // Sort placements by card number (ascending)
  const sortedPlacements = [...placements].sort((a, b) => compareCards(a.card, b.card))
  
  let currentBoard = board
  const results: ProcessedPlacement[] = []
  
  for (const placement of sortedPlacements) {
    const { card, playerIndex, chosenRow } = placement
    
    // Find the appropriate row for this card
    const targetRow = getRowForCard(currentBoard, card)
    
    if (targetRow === -1) {
      // Card is too low for any row
      if (chosenRow === undefined) {
        throw new Error('Must choose a row for card too low')
      }
      
      const result = takeRow(currentBoard, chosenRow, card)
      results.push({
        card,
        playerIndex,
        rowIndex: chosenRow,
        takenCards: result.takenCards,
        newBoard: result.board
      })
      currentBoard = result.board
    } else {
      // Normal placement or 6th card rule
      const result = placeCard(currentBoard, targetRow, card)
      results.push({
        card,
        playerIndex,
        rowIndex: targetRow,
        takenCards: result.takenCards,
        newBoard: result.board
      })
      currentBoard = result.board
    }
  }
  
  return results
}

// Step-by-step card placement function
export const processCardPlacementStep = (
  board: Board,
  placement: CardPlacement
): StepResult => {
  const { card, chosenRow } = placement
  
  // Find the appropriate row for this card
  const targetRow = getRowForCard(board, card)
  
  if (targetRow === -1) {
    // Card is too low for any row
    if (chosenRow === undefined) {
      // Need to ask for row selection
      return {
        board: board,
        takenCards: [],
        rowIndex: -1,
        needsRowSelection: true
      }
    }
    
    // Apply the chosen row
    const result = takeRow(board, chosenRow, card)
    return {
      board: result.board,
      takenCards: result.takenCards,
      rowIndex: chosenRow,
      needsRowSelection: false
    }
  }
  
  // Normal placement or 6th card rule
  const result = placeCard(board, targetRow, card)
  return {
    board: result.board,
    takenCards: result.takenCards,
    rowIndex: targetRow,
    needsRowSelection: false
  }
}