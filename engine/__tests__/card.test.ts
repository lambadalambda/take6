import { 
  createCard, 
  calculateBullHeads, 
  compareCards, 
  canPlaceAfter,
  cardToString,
  isValidCardNumber,
  type Card 
} from '../card'

describe('Card functions', () => {
  describe('Card creation', () => {
    it('should create a card with a valid number', () => {
      const card = createCard(42)
      expect(card.number).toBe(42)
      expect(card.bullHeads).toBe(1)
    })

    it('should throw error for invalid card numbers', () => {
      expect(() => createCard(0)).toThrow('Card number must be between 1 and 104')
      expect(() => createCard(-5)).toThrow('Card number must be between 1 and 104')
      expect(() => createCard(105)).toThrow('Card number must be between 1 and 104')
      expect(() => createCard(200)).toThrow('Card number must be between 1 and 104')
    })

    it('should validate card numbers correctly', () => {
      expect(isValidCardNumber(1)).toBe(true)
      expect(isValidCardNumber(52)).toBe(true)
      expect(isValidCardNumber(104)).toBe(true)
      expect(isValidCardNumber(0)).toBe(false)
      expect(isValidCardNumber(105)).toBe(false)
      expect(isValidCardNumber(-1)).toBe(false)
    })
  })

  describe('Bull heads calculation', () => {
    it('should return 1 bull head for regular cards', () => {
      expect(calculateBullHeads(1)).toBe(1)
      expect(calculateBullHeads(2)).toBe(1)
      expect(calculateBullHeads(3)).toBe(1)
      expect(calculateBullHeads(4)).toBe(1)
      expect(calculateBullHeads(6)).toBe(1)
      expect(calculateBullHeads(42)).toBe(1)
    })

    it('should return 2 bull heads for cards ending in 5 (except 55)', () => {
      expect(calculateBullHeads(5)).toBe(2)
      expect(calculateBullHeads(15)).toBe(2)
      expect(calculateBullHeads(25)).toBe(2)
      expect(calculateBullHeads(35)).toBe(2)
      expect(calculateBullHeads(45)).toBe(2)
      expect(calculateBullHeads(65)).toBe(2)
      expect(calculateBullHeads(75)).toBe(2)
      expect(calculateBullHeads(85)).toBe(2)
      expect(calculateBullHeads(95)).toBe(2)
    })

    it('should return 3 bull heads for cards ending in 0', () => {
      expect(calculateBullHeads(10)).toBe(3)
      expect(calculateBullHeads(20)).toBe(3)
      expect(calculateBullHeads(30)).toBe(3)
      expect(calculateBullHeads(40)).toBe(3)
      expect(calculateBullHeads(50)).toBe(3)
      expect(calculateBullHeads(60)).toBe(3)
      expect(calculateBullHeads(70)).toBe(3)
      expect(calculateBullHeads(80)).toBe(3)
      expect(calculateBullHeads(90)).toBe(3)
      expect(calculateBullHeads(100)).toBe(3)
    })

    it('should return 5 bull heads for multiples of 11', () => {
      expect(calculateBullHeads(11)).toBe(5)
      expect(calculateBullHeads(22)).toBe(5)
      expect(calculateBullHeads(33)).toBe(5)
      expect(calculateBullHeads(44)).toBe(5)
      expect(calculateBullHeads(66)).toBe(5)
      expect(calculateBullHeads(77)).toBe(5)
      expect(calculateBullHeads(88)).toBe(5)
      expect(calculateBullHeads(99)).toBe(5)
    })

    it('should return 7 bull heads for card 55', () => {
      expect(calculateBullHeads(55)).toBe(7)
    })
  })

  describe('Card comparison', () => {
    it('should compare cards by number', () => {
      const card1 = createCard(10)
      const card2 = createCard(20)
      const card3 = createCard(20)

      expect(compareCards(card1, card2)).toBeLessThan(0)
      expect(compareCards(card2, card1)).toBeGreaterThan(0)
      expect(compareCards(card2, card3)).toBe(0)
    })

    it('should check if card can be placed after another', () => {
      const card10 = createCard(10)
      const card20 = createCard(20)
      const card5 = createCard(5)

      expect(canPlaceAfter(card20, card10)).toBe(true)
      expect(canPlaceAfter(card10, card20)).toBe(false)
      expect(canPlaceAfter(card5, card10)).toBe(false)
    })
  })

  describe('Card string representation', () => {
    it('should return a readable string format', () => {
      const card55 = createCard(55)
      expect(cardToString(card55)).toBe('Card 55 (7 bull heads)')
      
      const card42 = createCard(42)
      expect(cardToString(card42)).toBe('Card 42 (1 bull head)')
      
      const card10 = createCard(10)
      expect(cardToString(card10)).toBe('Card 10 (3 bull heads)')
    })
  })
})