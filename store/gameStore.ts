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
import { addPenaltyCards } from '../engine/player'
import { getRowForCard, placeCard, takeRow, processCardPlacementStep, type Board } from '../engine/board'
import { type Card } from '../engine/card'
import { createSmartBot, selectCardForSmartBot } from '../ai/smartBot'
import { type LogEntry } from '../components/GameLog'

export type GamePhase = 'waiting' | 'selecting' | 'selectingRow' | 'revealing' | 'resolvingStep' | 'waitingForRow' | 'resolving' | 'gameOver'

export type RowSelectionState = {
  playerIndex: number
  card: Card
}

export type ResolutionResult = {
  card: Card
  playerIndex: number
  rowIndex: number
  takenCards: Card[]
}

export type GameStore = {
  // State
  game: Game | null
  selectedCard: Card | null
  gamePhase: GamePhase
  rowSelection: RowSelectionState | null
  logEntries: LogEntry[]
  
  // Resolution state
  resolutionIndex: number
  resolutionBoard: Board | null
  resolutionResults: ResolutionResult[] | null
  
  // Actions
  initializeGame: (playerNames: string[]) => void
  startNewRound: () => void
  selectCard: (card: Card) => void
  submitTurn: () => void
  selectRow: (rowIndex: number) => void
  resolveCurrentRound: () => void
  
  // New step-by-step resolution actions
  startResolution: () => void
  processNextCard: () => void
  
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
  
  // Resolution state
  resolutionIndex: 0,
  resolutionBoard: null,
  resolutionResults: null,
  
  // Actions
  initializeGame: (playerNames) => {
    const game = createGame({ playerNames })
    set({ game, gamePhase: 'selecting', selectedCard: null })
  },
  
  startNewRound: () => {
    const { game } = get()
    if (!game) return
    
    const newGame = initializeRound(game)
    set({ 
      game: newGame, 
      selectedCard: null, 
      gamePhase: 'selecting', 
      logEntries: [],
      resolutionIndex: 0,
      resolutionBoard: null,
      resolutionResults: null
    })
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
    
    // All selections made, proceed to revealing animations
    set({ game: updatedGame, selectedCard: null, gamePhase: 'revealing' })
  },
  
  selectRow: (rowIndex) => {
    const { game, rowSelection, gamePhase, resolutionBoard, resolutionIndex, resolutionResults } = get()
    if (!game || !rowSelection) return
    
    if (gamePhase === 'waitingForRow') {
      // During step-by-step resolution
      const sortedSelections = [...game.playerSelections].sort((a, b) => a.card.number - b.card.number)
      const currentSelection = sortedSelections[resolutionIndex]
      
      // Apply the row selection directly to the resolution board
      const result = processCardPlacementStep(resolutionBoard!, {
        card: currentSelection.card,
        playerIndex: currentSelection.playerIndex,
        chosenRow: rowIndex
      })
      
      // Update resolution state and continue
      set({ 
        resolutionBoard: result.board,
        resolutionResults: [...(resolutionResults || []), {
          card: currentSelection.card,
          playerIndex: currentSelection.playerIndex,
          rowIndex: result.rowIndex,
          takenCards: result.takenCards
        }],
        resolutionIndex: resolutionIndex + 1,
        rowSelection: null,
        gamePhase: 'resolvingStep'
      })
      
      // Process next card after a delay
      setTimeout(() => get().processNextCard(), 1000)
    } else {
      // Old flow for backward compatibility (will be removed)
      const updatedGame = setChosenRowForPlayer(game, rowSelection.playerIndex, rowIndex)
      set({ 
        game: updatedGame,
        rowSelection: null,
        selectedCard: null,
        gamePhase: 'revealing'
      })
    }
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
      logEntries: [],
      resolutionIndex: 0,
      resolutionBoard: null,
      resolutionResults: null
    })
  },
  
  // New step-by-step resolution functions
  startResolution: () => {
    const { game } = get()
    if (!game || !getAllPlayersReady(game)) return
    
    // Initialize resolution state
    set({
      gamePhase: 'resolvingStep',
      resolutionIndex: 0,
      resolutionBoard: [...game.board.map(row => [...row])], // Deep copy
      resolutionResults: []
    })
    
    // Start processing cards after a short delay
    setTimeout(() => get().processNextCard(), 1000)
  },
  
  processNextCard: () => {
    const { game, resolutionIndex, resolutionBoard, resolutionResults } = get()
    if (!game || !resolutionBoard || !resolutionResults) return
    
    // Sort selections by card number
    const sortedSelections = [...game.playerSelections].sort((a, b) => a.card.number - b.card.number)
    
    if (resolutionIndex >= sortedSelections.length) {
      // All cards processed, complete resolution
      const newLogEntries: LogEntry[] = []
      
      // Generate log entries from results
      resolutionResults.forEach(result => {
        const player = game.players[result.playerIndex]
        if (result.takenCards.length > 0) {
          const bullHeads = result.takenCards.reduce((sum, c) => sum + c.bullHeads, 0)
          if (result.takenCards.length === 5) {
            // 6th card
            newLogEntries.push({
              player: player.name,
              card: result.card.number,
              action: 'sixth-card',
              row: result.rowIndex + 1,
              penaltyCards: result.takenCards.length,
              bullHeads
            })
          } else {
            // Took row (too low)
            newLogEntries.push({
              player: player.name,
              card: result.card.number,
              action: 'took-row',
              row: result.rowIndex + 1,
              penaltyCards: result.takenCards.length,
              bullHeads
            })
          }
        } else {
          // Normal placement
          newLogEntries.push({
            player: player.name,
            card: result.card.number,
            action: 'placed',
            row: result.rowIndex + 1
          })
        }
      })
      
      // Apply penalties to players and clear selections
      const updatedPlayers = game.players.map(player => {
        const playerResults = resolutionResults.filter(r => r.playerIndex === player.index)
        const penaltyCards = playerResults.flatMap(r => r.takenCards)
        
        let updated = { ...player, selectedCard: null }
        if (penaltyCards.length > 0) {
          updated = addPenaltyCards(updated, penaltyCards)
        }
        return updated
      })
      
      // Update game with final board and players
      const updatedGame = {
        ...game,
        board: resolutionBoard,
        players: updatedPlayers,
        playerSelections: []
      }
      
      // Check if game is over
      if (checkGameOver(updatedGame)) {
        set({ 
          game: updatedGame, 
          gamePhase: 'gameOver', 
          logEntries: newLogEntries,
          resolutionIndex: 0,
          resolutionBoard: null,
          resolutionResults: null
        })
      } else {
        set({ 
          game: updatedGame, 
          gamePhase: 'selecting', 
          logEntries: newLogEntries,
          resolutionIndex: 0,
          resolutionBoard: null,
          resolutionResults: null
        })
      }
      return
    }
    
    // Process current card
    const currentSelection = sortedSelections[resolutionIndex]
    const player = game.players[currentSelection.playerIndex]
    
    // Process the placement
    const result = processCardPlacementStep(resolutionBoard, {
      card: currentSelection.card,
      playerIndex: currentSelection.playerIndex,
      chosenRow: currentSelection.chosenRow
    })
    
    if (result.needsRowSelection) {
      // Need row selection
      if (currentSelection.playerIndex === 0) {
        // Human player - pause for selection
        set({
          gamePhase: 'waitingForRow',
          rowSelection: { 
            playerIndex: currentSelection.playerIndex, 
            card: currentSelection.card 
          }
        })
      } else {
        // Bot - auto-select row with minimum bull heads
        let minHeads = Infinity
        let bestRow = 0
        for (let i = 0; i < resolutionBoard.length; i++) {
          const heads = resolutionBoard[i].reduce((sum, c) => sum + c.bullHeads, 0)
          if (heads < minHeads) {
            minHeads = heads
            bestRow = i
          }
        }
        
        // Apply bot's choice and continue
        const botResult = processCardPlacementStep(resolutionBoard, {
          card: currentSelection.card,
          playerIndex: currentSelection.playerIndex,
          chosenRow: bestRow
        })
        
        set({
          resolutionBoard: botResult.board,
          resolutionResults: [...resolutionResults, {
            card: currentSelection.card,
            playerIndex: currentSelection.playerIndex,
            rowIndex: botResult.rowIndex,
            takenCards: botResult.takenCards
          }],
          resolutionIndex: resolutionIndex + 1
        })
        
        // Continue to next card after a delay
        setTimeout(() => get().processNextCard(), 1000)
      }
    } else {
      // Normal placement or 6th card - update and continue
      set({
        resolutionBoard: result.board,
        resolutionResults: [...resolutionResults, {
          card: currentSelection.card,
          playerIndex: currentSelection.playerIndex,
          rowIndex: result.rowIndex,
          takenCards: result.takenCards
        }],
        resolutionIndex: resolutionIndex + 1
      })
      
      // Continue to next card after a delay
      setTimeout(() => get().processNextCard(), 1000)
    }
  }
}))
