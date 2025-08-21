import { createEasyBot, selectCardForBot } from '../easyBot'
import { 
  createGame, 
  initializeRound, 
  selectCardForPlayer, 
  getAllPlayersReady,
  resolveRound,
  isRoundComplete,
  type Game 
} from '../../engine/game'

describe('Bot Integration with Game Engine', () => {
  it('should play a complete turn with bots', () => {
    // Create game with 1 human and 3 bots
    const game = createGame({ 
      playerNames: ['Human', 'Bot1', 'Bot2', 'Bot3'] 
    })
    
    // Initialize round
    let gameState = initializeRound(game)
    
    // Set up controlled board and hands to avoid randomness issues
    gameState = {
      ...gameState,
      board: [
        [{ number: 10, bullHeads: 3 }],
        [{ number: 20, bullHeads: 3 }],
        [{ number: 30, bullHeads: 3 }],
        [{ number: 40, bullHeads: 3 }]
      ],
      players: gameState.players.map((p, i) => ({
        ...p,
        // Give each player cards that are definitely higher than board cards
        hand: Array.from({ length: 10 }, (_, j) => ({ 
          number: 50 + i * 10 + j, 
          bullHeads: 1 
        }))
      }))
    }
    
    // Verify board is initialized
    expect(gameState.board.length).toBe(4)
    
    // Create bots for players 1, 2, 3
    const bots = [
      createEasyBot('Bot1'),
      createEasyBot('Bot2'),
      createEasyBot('Bot3')
    ]
    
    // Human player (index 0) selects a card
    const humanCard = gameState.players[0].hand[0]
    gameState = selectCardForPlayer(gameState, 0, humanCard)
    
    // Bots select their cards
    for (let i = 0; i < 3; i++) {
      const botIndex = i + 1
      const bot = bots[i]
      const player = gameState.players[botIndex]
      
      // Bot makes decision
      const decision = selectCardForBot(bot, player, gameState.board)
      
      // Apply bot's decision to game
      gameState = selectCardForPlayer(
        gameState, 
        botIndex, 
        decision.card, 
        decision.chosenRow
      )
    }
    
    // All players should be ready
    expect(getAllPlayersReady(gameState)).toBe(true)
    
    // Resolve the round
    const resolvedState = resolveRound(gameState)
    
    // Check that cards were placed on board
    // Note: Due to too-low cards taking rows, the total might vary
    const totalBoardCards = resolvedState.board.reduce((sum, row) => sum + row.length, 0)
    expect(totalBoardCards).toBeGreaterThanOrEqual(4) // At least 4 cards on board
    expect(totalBoardCards).toBeLessThanOrEqual(8) // At most 8 (4 starting + 4 placed)
    
    // All players should have 9 cards left (started with 10)
    resolvedState.players.forEach(player => {
      expect(player.hand.length).toBe(9)
    })
  })

  it('should handle bot playing too-low card', () => {
    const game = createGame({ 
      playerNames: ['Human', 'Bot1', 'Bot2', 'Bot3'] 
    })
    
    let gameState = initializeRound(game)
    
    // Modify board to have high cards
    gameState = {
      ...gameState,
      board: [
        [{ number: 90, bullHeads: 3 }],
        [{ number: 91, bullHeads: 1 }],
        [{ number: 92, bullHeads: 1 }],
        [{ number: 93, bullHeads: 1 }]
      ]
    }
    
    // Give bot a low card
    gameState = {
      ...gameState,
      players: gameState.players.map((p, i) => 
        i === 1 ? { ...p, hand: [{ number: 5, bullHeads: 2 }] } : p
      )
    }
    
    const bot = createEasyBot('Bot1')
    const botPlayer = gameState.players[1]
    
    // Bot should decide to take a row
    const decision = selectCardForBot(bot, botPlayer, gameState.board)
    
    expect(decision.card.number).toBe(5)
    expect(decision.chosenRow).toBeDefined()
    expect(decision.chosenRow).toBeGreaterThanOrEqual(0)
    expect(decision.chosenRow).toBeLessThanOrEqual(3)
  })

  it('should play multiple complete turns', () => {
    const game = createGame({ 
      playerNames: ['Bot1', 'Bot2', 'Bot3', 'Bot4'] 
    })
    
    let gameState = initializeRound(game)
    
    // Set up controlled state to avoid randomness
    gameState = {
      ...gameState,
      board: [
        [{ number: 5, bullHeads: 2 }],
        [{ number: 10, bullHeads: 3 }],
        [{ number: 15, bullHeads: 2 }],
        [{ number: 20, bullHeads: 3 }]
      ],
      players: gameState.players.map((p, i) => ({
        ...p,
        // Give each bot cards that are higher than board to avoid too-low issues
        hand: Array.from({ length: 10 }, (_, j) => ({ 
          number: 25 + i * 20 + j, 
          bullHeads: 1 
        }))
      }))
    }
    
    const bots = gameState.players.map(p => createEasyBot(p.name))
    
    // Play 3 turns
    for (let turn = 0; turn < 3; turn++) {
      // Each bot selects a card
      for (let i = 0; i < 4; i++) {
        const bot = bots[i]
        const player = gameState.players[i]
        
        const decision = selectCardForBot(bot, player, gameState.board)
        gameState = selectCardForPlayer(
          gameState, 
          i, 
          decision.card, 
          decision.chosenRow
        )
      }
      
      // Resolve the turn
      expect(getAllPlayersReady(gameState)).toBe(true)
      gameState = resolveRound(gameState)
      
      // Check hand sizes
      gameState.players.forEach(player => {
        expect(player.hand.length).toBe(10 - turn - 1)
      })
    }
    
    // After 3 turns, players should have 7 cards each
    gameState.players.forEach(player => {
      expect(player.hand.length).toBe(7)
    })
  })
})