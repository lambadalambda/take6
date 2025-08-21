import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '../gameStore'
import { createCard } from '../../engine/card'

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      game: null,
      selectedCard: null,
      gamePhase: 'waiting',
      rowSelection: null,
      logEntries: []
    })
  })

  it('should initialize game with player names', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
    })
    
    expect(result.current.game).not.toBeNull()
    expect(result.current.game?.players).toHaveLength(4)
    expect(result.current.game?.players[0].name).toBe('Alice')
    expect(result.current.gamePhase).toBe('selecting')
  })

  it('should start new round', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    expect(result.current.game?.currentRound).toBe(1)
    expect(result.current.game?.board).toHaveLength(4)
    expect(result.current.game?.players[0].hand).toHaveLength(10)
  })

  it('should handle card selection for human player', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    const card = result.current.game?.players[0].hand[0]
    
    act(() => {
      result.current.selectCard(card!)
    })
    
    expect(result.current.selectedCard).toEqual(card)
  })

  it('should submit human turn and trigger bot turns', async () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    // Set up controlled board to avoid randomness
    act(() => {
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          board: [
            [createCard(10)],
            [createCard(20)],
            [createCard(30)],
            [createCard(40)]
          ],
          players: state.game.players.map((p, i) => ({
            ...p,
            hand: [createCard(50 + i * 5), ...p.hand.slice(1)]
          }))
        } : null
      }))
    })
    
    const card = result.current.game?.players[0].hand[0]
    
    act(() => {
      result.current.selectCard(card!)
      result.current.submitTurn()
    })
    
    // After submit, all players should have selected
    expect(result.current.game?.players[0].selectedCard).not.toBeNull()
    expect(result.current.game?.players[1].selectedCard).not.toBeNull()
    expect(result.current.game?.players[2].selectedCard).not.toBeNull()
    expect(result.current.game?.players[3].selectedCard).not.toBeNull()
    expect(result.current.gamePhase).toBe('resolving')
  })

  it('should handle too-low card requiring row selection', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    // Set up board with high cards
    act(() => {
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          board: [
            [createCard(90)],
            [createCard(91)],
            [createCard(92)],
            [createCard(93)]
          ],
          players: state.game.players.map((p, i) => ({
            ...p,
            hand: i === 0 ? [createCard(5), ...p.hand.slice(1)] : p.hand
          }))
        } : null
      }))
    })
    
    const lowCard = createCard(5)
    
    act(() => {
      result.current.selectCard(lowCard)
      result.current.submitTurn()
    })
    
    expect(result.current.gamePhase).toBe('selectingRow')
    expect(result.current.rowSelection).toEqual({ playerIndex: 0, card: lowCard })
  })

  it('should handle row selection for too-low card', () => {
    const { result } = renderHook(() => useGameStore())
    
    // Setup game with too-low card scenario
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
      
      const lowCard = createCard(5)
      
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          board: [
            [createCard(90)],
            [createCard(91)],
            [createCard(92)],
            [createCard(93)]
          ],
          players: state.game.players.map((p, i) => 
            i === 0 ? { ...p, hand: [lowCard, ...p.hand.slice(1)] } : p
          )
        } : null,
        rowSelection: { playerIndex: 0, card: lowCard },
        gamePhase: 'selectingRow'
      }))
    })
    
    act(() => {
      result.current.selectRow(2)
    })
    
    expect(result.current.rowSelection).toBeNull()
    expect(result.current.gamePhase).toBe('selecting')
  })

  it('should resolve round after all players ready', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    // Set up controlled board
    act(() => {
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          board: [
            [createCard(10)],
            [createCard(20)],
            [createCard(30)],
            [createCard(40)]
          ],
          players: state.game.players.map((p, i) => ({
            ...p,
            hand: [createCard(50 + i * 5), ...p.hand.slice(1)]
          }))
        } : null
      }))
    })
    
    // Human player selects card
    const humanCard = result.current.game?.players[0].hand[0]
    
    act(() => {
      result.current.selectCard(humanCard!)
      result.current.submitTurn() // This will have bots select too
    })
    
    // Now resolve
    act(() => {
      result.current.resolveCurrentRound()
    })
    
    // After resolution, cards should be placed on board
    const totalBoardCards = result.current.game?.board.reduce((sum, row) => sum + row.length, 0) || 0
    expect(totalBoardCards).toBe(8) // 4 starting + 4 placed
    expect(result.current.gamePhase).toBe('selecting')
  })

  it('should detect game over condition', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      
      // Give a player 66+ penalty points
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          players: state.game.players.map((p, i) => 
            i === 0 ? { ...p, penaltyCards: Array(66).fill(createCard(1)) } : p
          )
        } : null
      }))
    })
    
    expect(result.current.isGameOver()).toBe(true)
    expect(result.current.getWinner()?.name).toBe('Bot1') // Lowest score wins
  })

  it('should reset game', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
      result.current.resetGame()
    })
    
    expect(result.current.game).toBeNull()
    expect(result.current.selectedCard).toBeNull()
    expect(result.current.gamePhase).toBe('waiting')
  })

  it('should generate log entries when resolving round', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    // Set up controlled board
    act(() => {
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          board: [
            [createCard(10)],
            [createCard(20)],
            [createCard(30)],
            [createCard(40)]
          ],
          players: state.game.players.map((p, i) => ({
            ...p,
            hand: [createCard(50 + i * 5), ...p.hand.slice(1)]
          }))
        } : null
      }))
    })
    
    // Human player selects card and submits
    const humanCard = result.current.game?.players[0].hand[0]
    
    act(() => {
      result.current.selectCard(humanCard!)
      result.current.submitTurn()
      result.current.resolveCurrentRound()
    })
    
    // Should have log entries for all 4 players
    expect(result.current.logEntries).toHaveLength(4)
    
    // All should be placed actions (no penalties)
    expect(result.current.logEntries.every(e => e.action === 'placed')).toBe(true)
    
    // Alice should be in the entries
    const aliceEntry = result.current.logEntries.find(e => e.player === 'Alice')
    expect(aliceEntry).toBeDefined()
    expect(aliceEntry?.card).toBe(50)
  })

  it('should generate log entry for sixth card', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
    })
    
    // Set up board with row that has 5 cards
    act(() => {
      useGameStore.setState(state => ({
        game: state.game ? {
          ...state.game,
          board: [
            [createCard(10), createCard(11), createCard(12), createCard(13), createCard(14)], // Full row
            [createCard(20)],
            [createCard(30)],
            [createCard(40)]
          ],
          players: state.game.players.map((p, i) => ({
            ...p,
            hand: i === 0 ? [createCard(15), ...p.hand.slice(1)] : p.hand // Alice gets 15 (6th card)
          }))
        } : null
      }))
    })
    
    const humanCard = createCard(15)
    
    act(() => {
      result.current.selectCard(humanCard)
      result.current.submitTurn()
      result.current.resolveCurrentRound()
    })
    
    // Find Alice's log entry
    const aliceEntry = result.current.logEntries.find(e => e.player === 'Alice')
    expect(aliceEntry?.action).toBe('sixth-card')
    expect(aliceEntry?.penaltyCards).toBe(5)
    expect(aliceEntry?.row).toBe(1)
  })

  it('should clear log entries when starting new round', () => {
    const { result } = renderHook(() => useGameStore())
    
    act(() => {
      result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      result.current.startNewRound()
      
      // Add some log entries
      useGameStore.setState({
        logEntries: [
          { player: 'Test', card: 10, action: 'placed', row: 1 }
        ]
      })
    })
    
    expect(result.current.logEntries).toHaveLength(1)
    
    act(() => {
      result.current.startNewRound()
    })
    
    expect(result.current.logEntries).toHaveLength(0)
  })
})