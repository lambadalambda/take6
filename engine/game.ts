import { type Card } from './card'
import { 
  type Player, 
  createPlayer, 
  selectCard,
  addToHand,
  addPenaltyCards,
  calculateScore
} from './player'
import { 
  type Board,
  type CardPlacement,
  createBoard,
  processCardPlacements
} from './board'
import { createDeck, shuffleDeck, dealCards } from './deck'

export type GameConfig = {
  playerNames: string[]
}

export type PlayerSelection = {
  playerIndex: number
  card: Card
  chosenRow?: number // For when card is too low
}

export type Game = {
  players: Player[]
  board: Board
  currentRound: number
  deck: Card[]
  playerSelections: PlayerSelection[] // Track selections with row choices
}

const MIN_PLAYERS = 2
const MAX_PLAYERS = 10
const CARDS_PER_PLAYER = 10
const GAME_OVER_SCORE = 66

export const createGame = (config: GameConfig): Game => {
  const { playerNames } = config
  
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    throw new Error(`Must have ${MIN_PLAYERS}-${MAX_PLAYERS} players`)
  }
  
  const players = playerNames.map((name, index) => createPlayer(name, index))
  
  return {
    players,
    board: [],
    currentRound: 0,
    deck: [],
    playerSelections: []
  }
}

export const initializeRound = (game: Game): Game => {
  // Create and shuffle deck
  const deck = shuffleDeck(createDeck())
  
  // Take first 4 cards for board
  const boardCards = deck.slice(0, 4)
  const board = createBoard(boardCards)
  
  // Deal remaining cards to players
  const remainingDeck = deck.slice(4)
  const hands = dealCards(remainingDeck, game.players.length, CARDS_PER_PLAYER)
  
  // Update players with new hands
  const players = game.players.map((player, index) => ({
    ...player,
    hand: hands[index],
    selectedCard: null
  }))
  
  return {
    ...game,
    players,
    board,
    deck: remainingDeck.slice(game.players.length * CARDS_PER_PLAYER),
    currentRound: game.currentRound + 1,
    playerSelections: []
  }
}

export const selectCardForPlayer = (game: Game, playerIndex: number, card: Card, chosenRow?: number): Game => {
  const player = game.players[playerIndex]
  if (!player) {
    throw new Error('Invalid player index')
  }

  const updatedPlayer = selectCard(player, card)
  
  // Store the selection with optional row choice
  const newSelection: PlayerSelection = {
    playerIndex,
    card,
    // We no longer try to predict if a row choice is needed here; if provided, we store it
    chosenRow
  }
  
  // Remove any existing selection for this player and add new one
  const playerSelections = [
    ...game.playerSelections.filter(s => s.playerIndex !== playerIndex),
    newSelection
  ]
  
  return {
    ...game,
    players: game.players.map((p, i) => 
      i === playerIndex ? updatedPlayer : p
    ),
    playerSelections
  }
}

export const needsRowSelection = (game: Game, playerIndex: number): boolean => {
  const player = game.players[playerIndex]
  if (!player || !player.selectedCard) return false
  // This check is ambiguous before resolution since earlier cards can change the board.
  // We conservatively return false here to avoid blocking readiness prematurely.
  return false
}

export const getAllPlayersReady = (game: Game): boolean => {
  // All players must have selected a card
  const allSelected = game.players.every(player => player.selectedCard !== null)
  if (!allSelected) return false
  
  // All players must have a selection stored
  const allHaveSelections = game.players.every((player, index) => 
    game.playerSelections.some(s => s.playerIndex === index)
  )
  return allHaveSelections
}

export const resolveRound = (game: Game): Game => {
  if (!getAllPlayersReady(game)) {
    throw new Error('Not all players have selected cards')
  }
  
  // Create card placements from selections
  const placements: CardPlacement[] = game.playerSelections.map(selection => ({
    card: selection.card,
    playerIndex: selection.playerIndex,
    chosenRow: selection.chosenRow
  }))
  
  // Process all placements
  const results = processCardPlacements(game.board, placements)
  
  // Update board to final state
  const finalBoard = results[results.length - 1].newBoard
  
  // Update players with penalty cards and clear selected cards
  const updatedPlayers = game.players.map(player => {
    // Find results for this player
    const playerResults = results.filter(r => r.playerIndex === player.index)
    
    // Collect all penalty cards this player took
    const penaltyCards = playerResults.flatMap(r => r.takenCards)
    
    // Update player
    let updated = { ...player, selectedCard: null }
    if (penaltyCards.length > 0) {
      updated = addPenaltyCards(updated, penaltyCards)
    }
    
    return updated
  })
  
  return {
    ...game,
    players: updatedPlayers,
    board: finalBoard,
    playerSelections: [] // Clear selections for next turn
  }
}

export const isRoundComplete = (game: Game): boolean => {
  return game.players.every(player => player.hand.length === 0)
}

export const isGameOver = (game: Game): boolean => {
  return game.players.some(player => calculateScore(player) >= GAME_OVER_SCORE)
}

export const getWinner = (game: Game): Player | null => {
  if (game.players.length === 0) return null
  
  return game.players.reduce((winner, player) => {
    const winnerScore = calculateScore(winner)
    const playerScore = calculateScore(player)
    return playerScore < winnerScore ? player : winner
  })
}

export const getPlayerByIndex = (game: Game, index: number): Player | undefined => {
  return game.players[index]
}

// Allow setting or updating a chosen row for a player's current selection.
export const setChosenRowForPlayer = (game: Game, playerIndex: number, chosenRow: number): Game => {
  if (playerIndex < 0 || playerIndex >= game.players.length) {
    throw new Error('Invalid player index')
  }
  if (!Number.isInteger(chosenRow) || chosenRow < 0 || chosenRow >= game.board.length) {
    throw new Error('Invalid row index')
  }
  const player = game.players[playerIndex]
  if (!player.selectedCard) {
    throw new Error('Player has not selected a card')
  }

  const selectionIndex = game.playerSelections.findIndex(s => s.playerIndex === playerIndex)
  if (selectionIndex === -1) {
    throw new Error('No selection found for player')
  }

  const updatedSelections = [...game.playerSelections]
  updatedSelections[selectionIndex] = {
    ...updatedSelections[selectionIndex],
    chosenRow
  }

  return {
    ...game,
    playerSelections: updatedSelections
  }
}
