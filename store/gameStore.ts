import { create } from 'zustand'
import { 
  createGame,
  initializeRound,
  selectCardForPlayer,
  resolveRound,
  isGameOver as checkGameOver,
  getWinner as findWinner,
  getAllPlayersReady,
  type Game 
} from '../engine/game'
import { getRowForCard } from '../engine/board'
import { type Card } from '../engine/card'
import { createEasyBot, selectCardForBot } from '../ai/easyBot'

export type GamePhase = 'waiting' | 'selecting' | 'selectingRow' | 'resolving' | 'gameOver'

export type RowSelectionState = {
  playerIndex: number
  card: Card
}

export type GameStore = {
  // State
  game: Game | null
  selectedCard: Card | null
  gamePhase: GamePhase
  rowSelection: RowSelectionState | null
  
  // Actions
  initializeGame: (playerNames: string[]) => void
  startNewRound: () => void
  selectCard: (card: Card) => void
  submitTurn: () => void
  selectRow: (rowIndex: number) => void
  resolveCurrentRound: () => void
  isGameOver: () => boolean
  getWinner: () => { name: string; index: number; score: number } | null
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  game: null,
  selectedCard: null,
  gamePhase: 'waiting',
  rowSelection: null,
  
  // Actions
  initializeGame: (playerNames) => {
    const game = createGame({ playerNames })
    set({ game, gamePhase: 'selecting', selectedCard: null })
  },
  
  startNewRound: () => {
    const { game } = get()
    if (!game) return
    
    const newGame = initializeRound(game)
    set({ game: newGame, selectedCard: null, gamePhase: 'selecting' })
  },
  
  selectCard: (card) => {
    set({ selectedCard: card })
  },
  
  submitTurn: () => {
    const { game, selectedCard } = get()
    if (!game || !selectedCard) return
    
    // Check if card is too low for board
    const targetRow = getRowForCard(game.board, selectedCard)
    
    if (targetRow === -1 && game.board.length > 0) {
      // Card is too low, need row selection
      set({ 
        rowSelection: { playerIndex: 0, card: selectedCard },
        gamePhase: 'selectingRow'
      })
      return
    }
    
    // Select card for human player
    let updatedGame = selectCardForPlayer(game, 0, selectedCard)
    
    // Have bots make their selections
    const bots = game.players.slice(1).map(p => createEasyBot(p.name))
    
    for (let i = 1; i < game.players.length; i++) {
      const bot = bots[i - 1]
      const player = updatedGame.players[i]
      const decision = selectCardForBot(bot, player, updatedGame.board)
      
      updatedGame = selectCardForPlayer(
        updatedGame,
        i,
        decision.card,
        decision.chosenRow
      )
    }
    
    set({ 
      game: updatedGame, 
      selectedCard: null,
      gamePhase: 'resolving'
    })
  },
  
  selectRow: (rowIndex) => {
    const { game, rowSelection } = get()
    if (!game || !rowSelection) return
    
    // Apply the row selection
    const updatedGame = selectCardForPlayer(
      game, 
      rowSelection.playerIndex, 
      rowSelection.card, 
      rowIndex
    )
    
    // Have bots make their selections
    const bots = game.players.slice(1).map(p => createEasyBot(p.name))
    
    let finalGame = updatedGame
    for (let i = 1; i < game.players.length; i++) {
      const bot = bots[i - 1]
      const player = finalGame.players[i]
      const decision = selectCardForBot(bot, player, finalGame.board)
      
      finalGame = selectCardForPlayer(
        finalGame,
        i,
        decision.card,
        decision.chosenRow
      )
    }
    
    set({ 
      game: finalGame,
      rowSelection: null,
      selectedCard: null,
      gamePhase: 'selecting'
    })
  },
  
  resolveCurrentRound: () => {
    const { game } = get()
    if (!game || !getAllPlayersReady(game)) return
    
    const resolved = resolveRound(game)
    
    // Check if game is over
    if (checkGameOver(resolved)) {
      set({ game: resolved, gamePhase: 'gameOver' })
    } else {
      set({ game: resolved, gamePhase: 'selecting' })
    }
  },
  
  isGameOver: () => {
    const { game } = get()
    return game ? checkGameOver(game) : false
  },
  
  getWinner: () => {
    const { game } = get()
    if (!game) return null
    
    const winner = findWinner(game)
    if (!winner) return null
    
    const score = winner.penaltyCards.reduce((sum, card) => sum + card.bullHeads, 0)
    return { name: winner.name, index: winner.index, score }
  },
  
  resetGame: () => {
    set({
      game: null,
      selectedCard: null,
      gamePhase: 'waiting',
      rowSelection: null
    })
  }
}))