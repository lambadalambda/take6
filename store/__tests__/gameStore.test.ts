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
      rowSelection: null
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
})