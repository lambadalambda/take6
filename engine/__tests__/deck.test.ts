import { 
  createDeck, 
  shuffleDeck, 
  dealCards,
  isDeckValid,
  type Deck 
} from '../deck'
import { type Card } from '../card'

describe('Deck functions', () => {
  describe('Deck creation', () => {
    it('should create a deck with 104 unique cards', () => {
      const deck = createDeck()
      expect(deck.length).toBe(104)
    })

    it('should contain all cards from 1 to 104', () => {
      const deck = createDeck()
      const numbers = deck.map(card => card.number).sort((a, b) => a - b)
      
      for (let i = 1; i <= 104; i++) {
        expect(numbers[i - 1]).toBe(i)
      }
    })

    it('should have no duplicate cards', () => {
      const deck = createDeck()
      const numbers = deck.map(card => card.number)
      const uniqueNumbers = new Set(numbers)
      expect(uniqueNumbers.size).toBe(104)
    })

    it('should assign correct bull heads to each card', () => {
      const deck = createDeck()
      
      // Check a few specific cards
      const card55 = deck.find(c => c.number === 55)
      expect(card55?.bullHeads).toBe(7)
      
      const card11 = deck.find(c => c.number === 11)
      expect(card11?.bullHeads).toBe(5)
      
      const card10 = deck.find(c => c.number === 10)
      expect(card10?.bullHeads).toBe(3)
      
      const card5 = deck.find(c => c.number === 5)
      expect(card5?.bullHeads).toBe(2)
      
      const card1 = deck.find(c => c.number === 1)
      expect(card1?.bullHeads).toBe(1)
    })
  })

  describe('Deck validation', () => {
    it('should validate a correct deck', () => {
      const deck = createDeck()
      expect(isDeckValid(deck)).toBe(true)
    })

    it('should invalidate a deck with wrong number of cards', () => {
      const deck = createDeck().slice(0, 100)
      expect(isDeckValid(deck)).toBe(false)
    })

    it('should invalidate a deck with duplicate cards', () => {
      const deck = createDeck()
      deck[0] = deck[1] // Create duplicate
      expect(isDeckValid(deck)).toBe(false)
    })

    it('should invalidate an empty deck', () => {
      expect(isDeckValid([])).toBe(false)
    })
  })

  describe('Deck shuffling', () => {
    it('should return a deck with the same cards', () => {
      const original = createDeck()
      const shuffled = shuffleDeck(original)
      
      expect(shuffled.length).toBe(104)
      
      const originalNumbers = original.map(c => c.number).sort((a, b) => a - b)
      const shuffledNumbers = shuffled.map(c => c.number).sort((a, b) => a - b)
      
      expect(shuffledNumbers).toEqual(originalNumbers)
    })

    it('should not modify the original deck', () => {
      const original = createDeck()
      const originalCopy = [...original]
      const shuffled = shuffleDeck(original)
      
      expect(original).toEqual(originalCopy)
      expect(shuffled).not.toBe(original) // Different array reference
    })

    it('should actually shuffle the deck (not return same order)', () => {
      const original = createDeck()
      const shuffled = shuffleDeck(original)
      
      // It's astronomically unlikely that shuffling maintains the exact same order
      // But we'll check that at least some cards moved position
      let differentPositions = 0
      for (let i = 0; i < original.length; i++) {
        if (original[i].number !== shuffled[i].number) {
          differentPositions++
        }
      }
      
      // At least 50% of cards should be in different positions
      expect(differentPositions).toBeGreaterThan(50)
    })
  })

  describe('Dealing cards', () => {
    it('should deal cards to specified number of players', () => {
      const deck = createDeck()
      const hands = dealCards(deck, 4, 10)
      
      expect(hands.length).toBe(4) // 4 players
      expect(hands[0].length).toBe(10) // 10 cards each
      expect(hands[1].length).toBe(10)
      expect(hands[2].length).toBe(10)
      expect(hands[3].length).toBe(10)
    })

    it('should deal unique cards (no duplicates across hands)', () => {
      const deck = shuffleDeck(createDeck())
      const hands = dealCards(deck, 4, 10)
      
      const allDealtCards: Card[] = hands.flat()
      const uniqueNumbers = new Set(allDealtCards.map(c => c.number))
      
      expect(uniqueNumbers.size).toBe(40) // 4 players * 10 cards
    })

    it('should deal cards in round-robin fashion', () => {
      const deck = createDeck() // Ordered deck 1-104
      const hands = dealCards(deck, 4, 3)
      
      // Player 0 gets cards 0, 4, 8 (indices)
      expect(hands[0][0].number).toBe(1)
      expect(hands[0][1].number).toBe(5)
      expect(hands[0][2].number).toBe(9)
      
      // Player 1 gets cards 1, 5, 9 (indices)
      expect(hands[1][0].number).toBe(2)
      expect(hands[1][1].number).toBe(6)
      expect(hands[1][2].number).toBe(10)
      
      // Player 2 gets cards 2, 6, 10 (indices)
      expect(hands[2][0].number).toBe(3)
      expect(hands[2][1].number).toBe(7)
      expect(hands[2][2].number).toBe(11)
      
      // Player 3 gets cards 3, 7, 11 (indices)
      expect(hands[3][0].number).toBe(4)
      expect(hands[3][1].number).toBe(8)
      expect(hands[3][2].number).toBe(12)
    })

    it('should throw error if not enough cards in deck', () => {
      const smallDeck = createDeck().slice(0, 30)
      expect(() => dealCards(smallDeck, 4, 10)).toThrow('Not enough cards in deck')
    })

    it('should throw error for invalid number of players', () => {
      const deck = createDeck()
      expect(() => dealCards(deck, 0, 10)).toThrow('Invalid number of players')
      expect(() => dealCards(deck, -1, 10)).toThrow('Invalid number of players')
    })

    it('should throw error for invalid cards per player', () => {
      const deck = createDeck()
      expect(() => dealCards(deck, 4, 0)).toThrow('Invalid cards per player')
      expect(() => dealCards(deck, 4, -1)).toThrow('Invalid cards per player')
    })
  })
})