import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '../gameStore'
import { createCard } from '../../engine/card'

describe('Game Store - Refactored', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      game: null,
      selectedCard: null,
      gamePhase: 'selecting', // Start directly in selecting, no 'waiting'
      logEntries: [],
      resolutionIndex: 0,
      resolutionBoard: null,
      resolutionResults: null
    })
  })

  describe('Simplified Game Phases', () => {
    it('should only use selecting, revealing, resolvingStep, and gameOver phases', () => {
      const { result } = renderHook(() => useGameStore())
      
      // Initial state should be selecting
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      })
      expect(result.current.gamePhase).toBe('selecting')
      
      // After submitting turn, should go to revealing
      act(() => {
        const card = result.current.game!.players[0].hand[0]
        result.current.selectCard(card)
        result.current.submitTurn()
      })
      expect(result.current.gamePhase).toBe('revealing')
      
      // Then to resolvingStep (never 'resolving')
      act(() => {
        result.current.startResolution()
      })
      expect(result.current.gamePhase).toBe('resolvingStep')
    })
    
    it('should never enter waiting or resolving phases', () => {
      const { result } = renderHook(() => useGameStore())
      
      // Track all phase changes
      const phaseChanges: string[] = []
      const unsubscribe = useGameStore.subscribe(
        (state) => state.gamePhase,
        (phase) => phaseChanges.push(phase)
      )
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      })
      
      act(() => {
        const card = result.current.game!.players[0].hand[0]
        result.current.selectCard(card)
        result.current.submitTurn()
        result.current.startResolution()
      })
      
      // Should never have 'waiting' or 'resolving'
      expect(phaseChanges).not.toContain('waiting')
      expect(phaseChanges).not.toContain('resolving')
      
      unsubscribe()
    })
  })

  describe('Step-by-Step Resolution Only', () => {
    it('should always use step-by-step resolution, never batch', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      })
      
      // Submit a turn
      act(() => {
        const card = result.current.game!.players[0].hand[0]
        result.current.selectCard(card)
        result.current.submitTurn()
      })
      
      // Should have playerSelections ready
      expect(result.current.game?.playerSelections).toHaveLength(4)
      
      // Start resolution - should use step-by-step
      act(() => {
        result.current.startResolution()
      })
      
      expect(result.current.gamePhase).toBe('resolvingStep')
      expect(result.current.resolutionIndex).toBe(0)
      expect(result.current.resolutionBoard).not.toBeNull()
      expect(result.current.resolutionResults).toEqual([])
    })
    
    it('should process cards incrementally with processNextCard', () => {
      const { result } = renderHook(() => useGameStore())
      
      // Setup game with known cards
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
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
              hand: [createCard(15 + i * 10)] // 15, 25, 35, 45
            }))
          } : null
        }))
      })
      
      act(() => {
        // Select and submit cards
        result.current.selectCard(createCard(15))
        result.current.submitTurn()
        result.current.startResolution()
      })
      
      expect(result.current.resolutionIndex).toBe(0)
      
      // Process first card
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionIndex).toBe(1)
      expect(result.current.resolutionResults).toHaveLength(1)
    })
  })

  describe('No Row Selection State', () => {
    it('should not have rowSelection state', () => {
      const { result } = renderHook(() => useGameStore())
      
      // rowSelection property shouldn't exist
      expect('rowSelection' in result.current).toBe(false)
    })
    
    it('should auto-select rows without user interaction', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            board: [
              [createCard(50)],
              [createCard(60)],
              [createCard(70)],
              [createCard(80)]
            ],
            players: state.game.players.map((p, i) => ({
              ...p,
              hand: [createCard(i === 0 ? 5 : 85 + i)] // Human has card too low
            }))
          } : null
        }))
      })
      
      act(() => {
        result.current.selectCard(createCard(5))
        result.current.submitTurn()
        result.current.startResolution()
        result.current.processNextCard()
      })
      
      // Should auto-select row 0 (least bull heads) without user interaction
      expect(result.current.resolutionBoard?.[0]).toHaveLength(1)
      expect(result.current.resolutionBoard?.[0][0].number).toBe(5)
      expect(result.current.gamePhase).toBe('resolvingStep') // Not waiting for input
    })
  })

  describe('Simplified Bot Logic', () => {
    it('should not pre-select rows for bots', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
      })
      
      act(() => {
        const card = result.current.game!.players[0].hand[0]
        result.current.selectCard(card)
        result.current.submitTurn()
      })
      
      // Bot selections should not have chosenRow pre-set
      const botSelections = result.current.game?.playerSelections.filter(s => s.playerIndex > 0)
      botSelections?.forEach(selection => {
        expect(selection.chosenRow).toBeUndefined()
      })
    })
  })

  describe('Clean Game State', () => {
    it('should not have obsolete functions like resolveCurrentRound', () => {
      const { result } = renderHook(() => useGameStore())
      
      // resolveCurrentRound should not exist
      expect('resolveCurrentRound' in result.current).toBe(false)
    })
    
    it('should not have selectRow function', () => {
      const { result } = renderHook(() => useGameStore())
      
      // selectRow should not exist
      expect('selectRow' in result.current).toBe(false)
    })
  })
})