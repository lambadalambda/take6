import { 
  createEasyBot,
  selectCardForBot,
  type Bot,
  type BotDecision
} from '../easyBot'
import { createCard, type Card } from '../../engine/card'
import { createBoard, type Board } from '../../engine/board'
import { createPlayer, type Player } from '../../engine/player'

describe('Easy Bot', () => {
  describe('Bot creation', () => {
    it('should create a bot with a name and difficulty', () => {
      const bot = createEasyBot('EasyBot1')
      
      expect(bot.name).toBe('EasyBot1')
      expect(bot.difficulty).toBe('easy')
    })
  })

  describe('Card selection', () => {
    it('should select a random card from hand', () => {
      const bot = createEasyBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(10), createCard(20), createCard(30)]
      }
      
      const decision = selectCardForBot(bot, player, [])
      
      expect(decision.card).toBeDefined()
      expect(player.hand.some(c => c.number === decision.card.number)).toBe(true)
    })

    it('should always return a valid card from hand', () => {
      const bot = createEasyBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(42)]
      }
      
      const decision = selectCardForBot(bot, player, [])
      
      expect(decision.card.number).toBe(42)
    })

    it('should work with different hand sizes', () => {
      const bot = createEasyBot('TestBot')
      
      // Test with various hand sizes
      for (let handSize = 1; handSize <= 10; handSize++) {
        const hand: Card[] = []
        for (let i = 1; i <= handSize; i++) {
          hand.push(createCard(i * 10))
        }
        
        const player: Player = {
          ...createPlayer('TestBot', 0),
          hand
        }
        
        const decision = selectCardForBot(bot, player, [])
        expect(hand.some(c => c.number === decision.card.number)).toBe(true)
      }
    })

    it('should throw error if hand is empty', () => {
      const bot = createEasyBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: []
      }
      
      expect(() => selectCardForBot(bot, player, [])).toThrow('No cards in hand')
    })
  })


  describe('Bot decision making', () => {
    it('should return decision with card and optional row', () => {
      const bot = createEasyBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(25)]
      }
      const board: Board = createBoard([
        createCard(10),
        createCard(20),
        createCard(30),
        createCard(40)
      ])
      
      const decision = selectCardForBot(bot, player, board)
      
      expect(decision.card.number).toBe(25)
      // No row pre-selection anymore
    })

    it('should handle card that is too low', () => {
      const bot = createEasyBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(5)]
      }
      const board: Board = createBoard([
        createCard(50),
        createCard(60),
        createCard(70),
        createCard(80)
      ])
      
      const decision = selectCardForBot(bot, player, board)
      
      expect(decision.card.number).toBe(5)
      // Row selection now happens automatically during resolution
    })

    it('should handle mixed scenarios', () => {
      const bot = createEasyBot('TestBot')
      
      // Scenario 1: Normal placement
      const player1: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(15), createCard(25), createCard(35)]
      }
      const board1: Board = createBoard([
        createCard(10),
        createCard(20),
        createCard(30),
        createCard(40)
      ])
      
      const decision1 = selectCardForBot(bot, player1, board1)
      expect(decision1.chosenRow).toBeUndefined()
      
      // Scenario 2: Too low, needs row choice
      const player2: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(1), createCard(2), createCard(3)]
      }
      const board2: Board = createBoard([
        createCard(50),
        createCard(60),
        createCard(70),
        createCard(80)
      ])
      
      const decision2 = selectCardForBot(bot, player2, board2)
      // Easy bot picks randomly, so just verify it picked from the hand
      expect([1, 2, 3]).toContain(decision2.card.number)
    })
  })
})