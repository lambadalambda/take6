import { 
  createSmartBot,
  selectCardForSmartBot,
  type SmartBot
} from '../smartBot'
import { createCard, type Card } from '../../engine/card'
import { type Board } from '../../engine/board'
import { createPlayer, type Player } from '../../engine/player'

describe('Smart Bot', () => {
  describe('Bot creation', () => {
    it('should create a smart bot with name and difficulty', () => {
      const bot = createSmartBot('SmartBot1')
      
      expect(bot.name).toBe('SmartBot1')
      expect(bot.difficulty).toBe('smart')
    })
  })

  describe('Card selection strategy', () => {
    it('should select lowest card that can be placed safely', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(15), createCard(25), createCard(35), createCard(45)]
      }
      const board: Board = [
        [createCard(10)],  // 15 would go here
        [createCard(20)],  // 25 would go here
        [createCard(30)],  // 35 would go here
        [createCard(40)]   // 45 would go here
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      // Should pick 15 as it's the lowest safe card
      expect(decision.card.number).toBe(15)
      // No row pre-selection anymore
    })

    it('should avoid cards that would be 6th in a row', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(15), createCard(25), createCard(35)]
      }
      const board: Board = [
        [createCard(10), createCard(11), createCard(12), createCard(13), createCard(14)], // Row full - 15 would be 6th
        [createCard(20)],
        [createCard(30)],
        [createCard(40)]
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      // Should skip 15 (would be 6th card) and pick 25
      expect(decision.card.number).toBe(25)
      // No row pre-selection anymore
    })

    it('should choose card with minimum penalty if all cards cause penalties', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(16), createCard(17), createCard(18)]
      }
      const board: Board = [
        [createCard(10), createCard(11), createCard(12), createCard(13), createCard(14)], // 5 cards, 15 bull heads
        [createCard(20), createCard(21)], // 2 cards, 4 bull heads
        [createCard(30), createCard(31), createCard(32)], // 3 cards, 6 bull heads
        [createCard(40)] // 1 card, 3 bull heads
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      // All cards would be 6th in row 0, should pick any and minimize penalty
      expect([16, 17, 18]).toContain(decision.card.number)
    })

    it('should handle card that is too low', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(5)]  // Too low for all rows
      }
      const board: Board = [
        [createCard(50), createCard(51), createCard(52)], // 3 cards, 6 bull heads
        [createCard(60), createCard(61)], // 2 cards, 4 bull heads
        [createCard(70), createCard(71), createCard(72), createCard(73)], // 4 cards, 8 bull heads
        [createCard(80)] // 1 card, 3 bull heads (minimum)
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      expect(decision.card.number).toBe(5)
      // Row selection happens automatically during resolution
    })

    it('should handle hand with only too-low cards', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(1), createCard(2), createCard(3)]
      }
      const board: Board = [
        [createCard(50)],
        [createCard(60)],
        [createCard(70)],
        [createCard(80)]
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      // Should pick lowest card (1) and choose row with least bull heads
      expect(decision.card.number).toBe(1)
      // Row selection happens automatically during resolution
    })

    it('should prefer lower cards when multiple safe options exist', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(55), createCard(65), createCard(75), createCard(85)]
      }
      const board: Board = [
        [createCard(50)],
        [createCard(60)],
        [createCard(70)],
        [createCard(80)]
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      // Should pick 55 as it's the lowest safe card
      expect(decision.card.number).toBe(55)
    })

    it('should handle single card in hand', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(42)]
      }
      const board: Board = [
        [createCard(10)],
        [createCard(20)],
        [createCard(30)],
        [createCard(40)]
      ]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      expect(decision.card.number).toBe(42)
      // No row pre-selection anymore
    })

    it('should handle empty board', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: [createCard(10), createCard(20), createCard(30)]
      }
      const board: Board = [[], [], [], []]
      
      const decision = selectCardForSmartBot(bot, player, board)
      
      // With empty board, just pick lowest card
      expect(decision.card.number).toBe(10)
      // No row pre-selection anymore
    })

    it('should throw error if hand is empty', () => {
      const bot = createSmartBot('TestBot')
      const player: Player = {
        ...createPlayer('TestBot', 0),
        hand: []
      }
      const board: Board = [[createCard(10)], [createCard(20)], [createCard(30)], [createCard(40)]]
      
      expect(() => selectCardForSmartBot(bot, player, board)).toThrow('No cards in hand')
    })
  })
})