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
import { createSmartBot, selectCardForSmartBot } from '../ai/smartBot'
import { type LogEntry } from '../components/GameLog'

export type GamePhase = 'waiting' | 'selecting' | 'selectingRow' | 'revealing' | 'resolving' | 'gameOver'

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
  logEntries: LogEntry[]
  
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
  logEntries: [],
  
  // Actions
  initializeGame: (playerNames) => {
    const game = createGame({ playerNames })
    set({ game, gamePhase: 'selecting', selectedCard: null })
  },
  
  startNewRound: () => {
    const { game } = get()
    if (!game) return
    
    const newGame = initializeRound(game)
    set({ game: newGame, selectedCard: null, gamePhase: 'selecting', logEntries: [] })
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
    const bots = game.players.slice(1).map(p => createSmartBot(p.name))
    
    for (let i = 1; i < game.players.length; i++) {
      const bot = bots[i - 1]
      const player = updatedGame.players[i]
      const decision = selectCardForSmartBot(bot, player, updatedGame.board)
      
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
      gamePhase: 'revealing'
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
    const bots = game.players.slice(1).map(p => createSmartBot(p.name))
    
    let finalGame = updatedGame
    for (let i = 1; i < game.players.length; i++) {
      const bot = bots[i - 1]
      const player = finalGame.players[i]
      const decision = selectCardForSmartBot(bot, player, finalGame.board)
      
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
      gamePhase: 'revealing'
    })
  },
  
  resolveCurrentRound: () => {
    const { game } = get()
    if (!game || !getAllPlayersReady(game)) return
    
    // Generate log entries before resolution
    const newLogEntries: LogEntry[] = []
    
    // Sort selections by card value for proper order
    const sortedSelections = [...game.playerSelections]
      .sort((a, b) => a.card.number - b.card.number)
    
    sortedSelections.forEach(selection => {
      const player = game.players[selection.playerIndex]
      const card = selection.card
      const targetRow = getRowForCard(game.board, card)
      
      if (targetRow === -1) {
        // Too low card - player chose a row
        const chosenRow = selection.chosenRow || 0
        const takenCards = game.board[chosenRow]
        const bullHeads = takenCards.reduce((sum, c) => sum + c.bullHeads, 0)
        
        newLogEntries.push({
          player: player.name,
          card: card.number,
          action: 'took-row',
          row: chosenRow + 1,
          penaltyCards: takenCards.length,
          bullHeads
        })
      } else {
        const row = game.board[targetRow]
        
        if (row.length === 5) {
          // 6th card - takes the row
          const bullHeads = row.reduce((sum, c) => sum + c.bullHeads, 0)
          
          newLogEntries.push({
            player: player.name,
            card: card.number,
            action: 'sixth-card',
            row: targetRow + 1,
            penaltyCards: row.length,
            bullHeads
          })
        } else {
          // Normal placement
          newLogEntries.push({
            player: player.name,
            card: card.number,
            action: 'placed',
            row: targetRow + 1
          })
        }
      }
    })
    
    const resolved = resolveRound(game)
    
    // Check if game is over
    if (checkGameOver(resolved)) {
      set({ game: resolved, gamePhase: 'gameOver', logEntries: newLogEntries })
    } else {
      set({ game: resolved, gamePhase: 'selecting', logEntries: newLogEntries })
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
      rowSelection: null,
      logEntries: []
    })
  }
}))