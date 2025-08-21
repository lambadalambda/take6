import { 
  createEasyBot,
  selectCardForBot,
  selectRowForBot,
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

  describe('Row selection for too-low cards', () => {
    it('should select a random row when card is too low', () => {
      const bot = createEasyBot('TestBot')
      const board: Board = createBoard([
        createCard(50),
        createCard(60),
        createCard(70),
        createCard(80)
      ])
      
      const lowCard = createCard(5)
      const rowChoice = selectRowForBot(bot, lowCard, board)
      
      expect(rowChoice).toBeGreaterThanOrEqual(0)
      expect(rowChoice).toBeLessThanOrEqual(3)
    })

    it('should return valid row index', () => {
      const bot = createEasyBot('TestBot')
      const board: Board = createBoard([
        createCard(10),
        createCard(20),
        createCard(30),
        createCard(40)
      ])
      
      // Run multiple times to ensure randomness doesn't break bounds
      for (let i = 0; i < 20; i++) {
        const rowChoice = selectRowForBot(bot, createCard(1), board)
        expect(rowChoice).toBeGreaterThanOrEqual(0)
        expect(rowChoice).toBeLessThanOrEqual(3)
      }
    })

    it('should work with partially filled rows', () => {
      const bot = createEasyBot('TestBot')
      const board: Board = [
        [createCard(10), createCard(15), createCard(18)],
        [createCard(20)],
        [createCard(30), createCard(35)],
        [createCard(40), createCard(45), createCard(48), createCard(49)]
      ]
      
      const rowChoice = selectRowForBot(bot, createCard(5), board)
      
      expect(rowChoice).toBeGreaterThanOrEqual(0)
      expect(rowChoice).toBeLessThanOrEqual(3)
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
      expect(decision.chosenRow).toBeUndefined() // Card can be placed normally
    })

    it('should include row choice when card is too low', () => {
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
      expect(decision.chosenRow).toBeDefined()
      expect(decision.chosenRow).toBeGreaterThanOrEqual(0)
      expect(decision.chosenRow).toBeLessThanOrEqual(3)
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
      expect(decision2.chosenRow).toBeDefined()
    })
  })
})