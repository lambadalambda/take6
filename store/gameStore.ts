import { create } from 'zustand'
import { 
  createGame,
  initializeRound,
  selectCardForPlayer,
  resolveRound,
  isGameOver as checkGameOver,
  getWinner as findWinner,
  getAllPlayersReady,
  setChosenRowForPlayer,
  type Game 
} from '../engine/game'
import { getRowForCard, placeCard, takeRow } from '../engine/board'
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

    // Select card for human player (no row choice upfront)
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
    
    // Pre-check: if human will need to choose a row during resolution, prompt before showing animations
    let tempBoard = updatedGame.board
    const sortedSelections = [...updatedGame.playerSelections].sort((a, b) => a.card.number - b.card.number)
    for (const s of sortedSelections) {
      const target = getRowForCard(tempBoard, s.card)
      if (target === -1) {
        if (s.playerIndex === 0 && s.chosenRow === undefined) {
          set({ game: updatedGame, selectedCard: null, rowSelection: { playerIndex: 0, card: s.card }, gamePhase: 'selectingRow' })
          return
        }
        // Simulate taking a row
        const rowIndex = s.chosenRow !== undefined ? s.chosenRow : (() => {
          let min = Infinity, best = 0
          for (let i = 0; i < tempBoard.length; i++) {
            const heads = tempBoard[i].reduce((sum, c) => sum + c.bullHeads, 0)
            if (heads < min) { min = heads; best = i }
          }
          return best
        })()
        tempBoard = takeRow(tempBoard, rowIndex, s.card).board
      } else {
        tempBoard = placeCard(tempBoard, target, s.card).board
      }
    }

    // No immediate human row choice; proceed to revealing animations
    set({ game: updatedGame, selectedCard: null, gamePhase: 'revealing' })
  },
  
  selectRow: (rowIndex) => {
    const { game, rowSelection } = get()
    if (!game || !rowSelection) return
    
    // Apply the row selection for the already-selected card
    const updatedGame = setChosenRowForPlayer(game, rowSelection.playerIndex, rowIndex)
    
    // Bots have already selected during submitTurn; proceed to revealing
    set({ 
      game: updatedGame,
      rowSelection: null,
      selectedCard: null,
      gamePhase: 'revealing'
    })
  },
  
  resolveCurrentRound: () => {
    const { game } = get()
    if (!game || !getAllPlayersReady(game)) return
    // Simulate resolution step-by-step to determine if any row choice is needed now
    let workGame = game
    let tempBoard = game.board
    const newLogEntries: LogEntry[] = []
    const selections = [...game.playerSelections].sort((a, b) => a.card.number - b.card.number)

    for (const selection of selections) {
      const { playerIndex, card } = selection
      const player = workGame.players[playerIndex]
      const targetRow = getRowForCard(tempBoard, card)

      if (targetRow === -1) {
        // Needs a row choice; if not provided yet, handle based on human vs bot
        const currentSelection = workGame.playerSelections.find(s => s.playerIndex === playerIndex)!
        let chosenRow = currentSelection.chosenRow

        if (chosenRow === undefined) {
          if (playerIndex === 0) {
            // Prompt human now and pause resolution
            set({ rowSelection: { playerIndex, card }, gamePhase: 'selectingRow' })
            return
          } else {
            // Bot: choose the row with minimum bull heads on the current board
            let minHeads = Infinity
            let bestRow = 0
            for (let i = 0; i < tempBoard.length; i++) {
              const heads = tempBoard[i].reduce((sum, c) => sum + c.bullHeads, 0)
              if (heads < minHeads) { minHeads = heads; bestRow = i }
            }
            workGame = setChosenRowForPlayer(workGame, playerIndex, bestRow)
            chosenRow = bestRow
          }
        }

        // Apply takeRow to simulated board and log
        const takenCards = tempBoard[chosenRow!]
        const bullHeads = takenCards.reduce((sum, c) => sum + c.bullHeads, 0)
        newLogEntries.push({
          player: player.name,
          card: card.number,
          action: 'took-row',
          row: (chosenRow as number) + 1,
          penaltyCards: takenCards.length,
          bullHeads
        })
        tempBoard = takeRow(tempBoard, chosenRow!, card).board
      } else {
        const row = tempBoard[targetRow]
        if (row.length >= 5) {
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
          newLogEntries.push({
            player: player.name,
            card: card.number,
            action: 'placed',
            row: targetRow + 1
          })
        }
        tempBoard = placeCard(tempBoard, targetRow, card).board
      }
    }

    // If we complete the loop, we can fully resolve the round now
    const resolved = resolveRound(workGame)
    
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
