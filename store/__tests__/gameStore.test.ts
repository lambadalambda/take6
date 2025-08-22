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
    expect(result.current.gamePhase).toBe('revealing')
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
      // Row selection is determined at resolution time
      result.current.resolveCurrentRound()
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
    })

    // Prepare too-low scenario
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
          players: state.game.players.map((p, i) => {
            if (i === 0) return { ...p, hand: [createCard(5), ...p.hand.slice(1)] }
            // Force bots to have high safe cards so human 5 resolves first
            const forced = 100 + i // 101,102,103 for bots 1..3
            return { ...p, hand: [createCard(forced)] }
          })
        } : null
      }))
    })

    // Human selects low card and submits
    const lowCard2 = createCard(5)
    act(() => {
      result.current.selectCard(lowCard2)
      result.current.submitTurn()
      result.current.resolveCurrentRound() // triggers selectingRow
    })

    expect(result.current.gamePhase).toBe('selectingRow')

    // Now choose the row
    act(() => {
      result.current.selectRow(2)
    })

    expect(result.current.rowSelection).toBeNull()
    expect(result.current.gamePhase).toBe('revealing')
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

  describe('Step-by-Step Resolution', () => {
    it('should process cards one at a time in ascending order', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2', 'Bot3'])
        result.current.startNewRound()
        
        // Set up controlled board and hands
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
              hand: [createCard(15 + i * 10), ...p.hand.slice(1)] // 15, 25, 35, 45
            }))
          } : null
        }))
      })
      
      // Select cards for all players
      act(() => {
        result.current.selectCard(createCard(15))
        result.current.submitTurn()
        
        // Manually set selections to ensure predictable cards
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            playerSelections: [
              { playerIndex: 0, card: createCard(15) },
              { playerIndex: 1, card: createCard(25) },
              { playerIndex: 2, card: createCard(35) },
              { playerIndex: 3, card: createCard(45) }
            ]
          } : null
        }))
      })
      
      // Start resolution
      act(() => {
        result.current.startResolution()
      })
      
      expect(result.current.gamePhase).toBe('resolvingStep')
      expect(result.current.resolutionIndex).toBe(0)
      
      // Process first card (15)
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionIndex).toBe(1)
      expect(result.current.resolutionBoard?.[0]).toHaveLength(2) // 10, 15
      
      // Process second card (25)
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionIndex).toBe(2)
      expect(result.current.resolutionBoard?.[1]).toHaveLength(2) // 20, 25
      
      // Continue with remaining cards
      act(() => {
        result.current.processNextCard() // 35
        result.current.processNextCard() // 45
        result.current.processNextCard() // Complete resolution
      })
      
      expect(result.current.gamePhase).toBe('selecting')
      expect(result.current.game?.board[0]).toHaveLength(2) // Final board updated
    })
    
    it('should update board state between card placements', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1'])
        result.current.startNewRound()
        
        // Set up board where first card changes available rows
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            board: [
              [createCard(10), createCard(11), createCard(12), createCard(13), createCard(14)], // Full
              [createCard(20)],
              [createCard(30)],
              [createCard(40)]
            ],
            players: state.game.players.map((p, i) => ({
              ...p,
              hand: i === 0 ? [createCard(15)] : [createCard(25)]
            }))
          } : null
        }))
      })
      
      act(() => {
        result.current.selectCard(createCard(15))
        result.current.submitTurn()
        result.current.startResolution()
      })
      
      // Process card 15 (should trigger 6th card rule)
      act(() => {
        result.current.processNextCard()
      })
      
      // Board should be updated: row 0 now just has [15]
      expect(result.current.resolutionBoard?.[0]).toHaveLength(1)
      expect(result.current.resolutionBoard?.[0][0].number).toBe(15)
      
      // Process card 25 (should now go to row 1, not row 0)
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionBoard?.[1]).toHaveLength(2) // 20, 25
    })
    
    it('should pause for row selection with current board state', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1'])
        result.current.startNewRound()
        
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            board: [
              [createCard(50)],
              [createCard(60)],
              [createCard(70)],
              [createCard(80)]
            ],
            players: [
              { ...state.game.players[0], hand: [createCard(5)] }, // Too low
              { ...state.game.players[1], hand: [createCard(65)] }
            ]
          } : null
        }))
      })
      
      act(() => {
        result.current.selectCard(createCard(5))
        result.current.submitTurn()
        result.current.startResolution()
        result.current.processNextCard() // Try to process card 5
      })
      
      expect(result.current.gamePhase).toBe('waitingForRow')
      expect(result.current.rowSelection?.card.number).toBe(5)
      expect(result.current.resolutionBoard).toEqual(result.current.game?.board) // Board unchanged
      
      // Select row 0
      act(() => {
        result.current.selectRow(0)
      })
      
      expect(result.current.gamePhase).toBe('resolvingStep')
      expect(result.current.resolutionBoard?.[0]).toHaveLength(1)
      expect(result.current.resolutionBoard?.[0][0].number).toBe(5)
      
      // Continue with next card
      act(() => {
        result.current.processNextCard() // Card 65
      })
      
      expect(result.current.resolutionBoard?.[1]).toHaveLength(2) // 60, 65 (closest lower row)
    })
    
    it('should handle multiple 6th cards in same turn correctly', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2'])
        result.current.startNewRound()
        
        // Set up board where multiple 6th cards will trigger
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            board: [
              [createCard(10), createCard(11), createCard(12), createCard(13), createCard(14)], // Full
              [createCard(20), createCard(21), createCard(22), createCard(23), createCard(24)], // Full
              [createCard(30)],
              [createCard(40)]
            ],
            players: [
              { ...state.game.players[0], hand: [createCard(15)] }, // 6th for row 0
              { ...state.game.players[1], hand: [createCard(16)] }, // Would be 6th but row 0 cleared
              { ...state.game.players[2], hand: [createCard(25)] }  // 6th for row 1
            ]
          } : null
        }))
      })
      
      act(() => {
        result.current.selectCard(createCard(15))
        result.current.submitTurn()
        result.current.startResolution()
      })
      
      // Process card 15 (6th card for row 0)
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionBoard?.[0]).toHaveLength(1)
      expect(result.current.resolutionBoard?.[0][0].number).toBe(15)
      expect(result.current.resolutionResults?.[0].takenCards).toHaveLength(5)
      
      // Process card 16 (goes to row 0 after 15, NOT 6th card)
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionBoard?.[0]).toHaveLength(2) // 15, 16
      expect(result.current.resolutionResults?.[1].takenCards).toHaveLength(0)
      
      // Process card 25 (6th card for row 1)
      act(() => {
        result.current.processNextCard()
      })
      
      expect(result.current.resolutionBoard?.[1]).toHaveLength(1)
      expect(result.current.resolutionBoard?.[1][0].number).toBe(25)
      expect(result.current.resolutionResults?.[2].takenCards).toHaveLength(5)
    })
    
    it('should handle bot row selection automatically during their turn', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1', 'Bot2'])
        result.current.startNewRound()
        
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            board: [
              [createCard(50)],
              [createCard(60)],
              [createCard(70)],
              [createCard(80)]
            ],
            players: [
              { ...state.game.players[0], hand: [createCard(55)] },
              { ...state.game.players[1], hand: [createCard(5)] }, // Bot with too-low card
              { ...state.game.players[2], hand: [createCard(75)] }
            ]
          } : null
        }))
      })
      
      act(() => {
        result.current.selectCard(createCard(55))
        result.current.submitTurn()
        
        // Manually set selections to ensure predictable cards
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            playerSelections: [
              { playerIndex: 0, card: createCard(55) },
              { playerIndex: 1, card: createCard(5) },
              { playerIndex: 2, card: createCard(75) }
            ]
          } : null
        }))
        
        result.current.startResolution()
      })
      
      // Process bot's card 5 (too low)
      act(() => {
        result.current.processNextCard()
      })
      
      // Bot should auto-select row with minimum bull heads, no pause
      expect(result.current.gamePhase).toBe('resolvingStep')
      expect(result.current.resolutionBoard?.[0]).toHaveLength(1)
      expect(result.current.resolutionBoard?.[0][0].number).toBe(5)
      
      // Continue with other cards
      act(() => {
        result.current.processNextCard() // 55
        result.current.processNextCard() // 75
        result.current.processNextCard() // Complete resolution
      })
      
      expect(result.current.gamePhase).toBe('selecting')
    })
    
    it('should complete resolution and update final game state', () => {
      const { result } = renderHook(() => useGameStore())
      
      act(() => {
        result.current.initializeGame(['Alice', 'Bot1'])
        result.current.startNewRound()
        
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            board: [
              [createCard(10)],
              [createCard(20)],
              [createCard(30)],
              [createCard(40)]
            ],
            players: [
              { ...state.game.players[0], hand: [createCard(11)] },
              { ...state.game.players[1], hand: [createCard(21)] }
            ]
          } : null
        }))
      })
      
      act(() => {
        result.current.selectCard(createCard(11))
        result.current.submitTurn()
        
        // Manually set selections to ensure predictable cards
        useGameStore.setState(state => ({
          game: state.game ? {
            ...state.game,
            playerSelections: [
              { playerIndex: 0, card: createCard(11) },
              { playerIndex: 1, card: createCard(21) }
            ]
          } : null
        }))
        
        result.current.startResolution()
        result.current.processNextCard() // 11
        result.current.processNextCard() // 21
        result.current.processNextCard() // Complete resolution
      })
      
      // Should complete resolution
      expect(result.current.gamePhase).toBe('selecting')
      expect(result.current.resolutionIndex).toBe(0)
      expect(result.current.resolutionBoard).toBeNull()
      
      // Final board should be updated
      expect(result.current.game?.board[0]).toHaveLength(2) // 10, 11
      expect(result.current.game?.board[1]).toHaveLength(2) // 20, 21
      
      // Players should have cards removed from hand
      expect(result.current.game?.players[0].hand).not.toContainEqual(createCard(11))
      expect(result.current.game?.players[1].hand).not.toContainEqual(createCard(21))
    })
  })
})
