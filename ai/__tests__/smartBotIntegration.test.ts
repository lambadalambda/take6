import { createSmartBot, selectCardForSmartBot } from '../smartBot'
import { 
  createGame, 
  initializeRound, 
  selectCardForPlayer, 
  getAllPlayersReady,
  resolveRound,
  type Game 
} from '../../engine/game'
import { createCard } from '../../engine/card'

describe('Smart Bot Integration with Game Engine', () => {
  it('should play conservatively and avoid penalties', () => {
    const game = createGame({ 
      playerNames: ['Human', 'SmartBot1', 'SmartBot2', 'SmartBot3'] 
    })
    
    let gameState = initializeRound(game)
    
    // Set up controlled board and hands for predictable test
    gameState = {
      ...gameState,
      board: [
        [createCard(10)],
        [createCard(20)],
        [createCard(30)],
        [createCard(40)]
      ],
      players: gameState.players.map((p, i) => ({
        ...p,
        // Give bots only specific cards for predictable behavior
        hand: [
          createCard(15 + i * 10), // Safe cards: 15, 25, 35, 45
          createCard(50 + i * 5),  // Higher cards: 50, 55, 60, 65
          createCard(70 + i * 5),  // Even higher: 70, 75, 80, 85
        ]
      }))
    }
    
    const bots = [
      createSmartBot('SmartBot1'),
      createSmartBot('SmartBot2'),
      createSmartBot('SmartBot3')
    ]
    
    // Human plays first
    gameState = selectCardForPlayer(gameState, 0, gameState.players[0].hand[0])
    
    // Smart bots select their cards
    for (let i = 0; i < 3; i++) {
      const botIndex = i + 1
      const bot = bots[i]
      const player = gameState.players[botIndex]
      
      const decision = selectCardForSmartBot(bot, player, gameState.board)
      
      // Bot should pick the lowest safe card
      expect(decision.card.number).toBe(15 + botIndex * 10)
      expect(decision.chosenRow).toBeUndefined()
      
      gameState = selectCardForPlayer(
        gameState, 
        botIndex, 
        decision.card, 
        decision.chosenRow
      )
    }
    
    expect(getAllPlayersReady(gameState)).toBe(true)
    
    const resolved = resolveRound(gameState)
    
    // No bot should have taken penalty cards (all played safe)
    resolved.players.slice(1).forEach(player => {
      expect(player.penaltyCards.length).toBe(0)
    })
  })

  it('should minimize penalty when forced to take cards', () => {
    const game = createGame({ 
      playerNames: ['Human', 'SmartBot1', 'SmartBot2', 'SmartBot3'] 
    })
    
    let gameState = initializeRound(game)
    
    // Set up board where bot must take penalty
    gameState = {
      ...gameState,
      board: [
        [createCard(90), createCard(91), createCard(92), createCard(93), createCard(94)], // Full, 15 bull heads
        [createCard(80)], // 3 bull heads
        [createCard(70), createCard(71)], // 4 bull heads  
        [createCard(60), createCard(61), createCard(62)], // 6 bull heads
      ],
      players: gameState.players.map((p, i) => ({
        ...p,
        // Give bot 1 a card that will be 6th on row 0, and a too-low card
        hand: i === 1 ? [createCard(95), createCard(5)] : p.hand
      }))
    }
    
    const smartBot = createSmartBot('SmartBot1')
    const botPlayer = gameState.players[1]
    
    const decision = selectCardForSmartBot(smartBot, botPlayer, gameState.board)
    
    // Bot should choose the too-low card and take the row with minimum penalty (row 1)
    expect(decision.card.number).toBe(5)
    expect(decision.chosenRow).toBe(1) // Row with only 3 bull heads
  })

  it('should handle multiple smart bots playing strategically', () => {
    const game = createGame({ 
      playerNames: ['SmartBot1', 'SmartBot2', 'SmartBot3', 'SmartBot4'] 
    })
    
    let gameState = initializeRound(game)
    
    // Give bots overlapping card ranges to create competition
    gameState = {
      ...gameState,
      board: [
        [createCard(20)],
        [createCard(30)],
        [createCard(40)],
        [createCard(50)]
      ],
      players: gameState.players.map((p, i) => ({
        ...p,
        hand: [
          createCard(21 + i), // Cards 21, 22, 23, 24
          createCard(31 + i), // Cards 31, 32, 33, 34
          createCard(41 + i), // Cards 41, 42, 43, 44
          createCard(51 + i), // Cards 51, 52, 53, 54
        ]
      }))
    }
    
    const bots = gameState.players.map(p => createSmartBot(p.name))
    
    // Each bot selects their lowest safe card
    for (let i = 0; i < 4; i++) {
      const bot = bots[i]
      const player = gameState.players[i]
      
      const decision = selectCardForSmartBot(bot, player, gameState.board)
      
      // Each bot should pick their lowest card (21+i)
      expect(decision.card.number).toBe(21 + i)
      
      gameState = selectCardForPlayer(
        gameState, 
        i, 
        decision.card, 
        decision.chosenRow
      )
    }
    
    const resolved = resolveRound(gameState)
    
    // All cards should be placed on row 0
    expect(resolved.board[0].length).toBe(5) // Original 20 + four new cards
    
    // No penalties taken
    resolved.players.forEach(player => {
      expect(player.penaltyCards.length).toBe(0)
    })
  })
})