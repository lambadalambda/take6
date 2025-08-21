import {
  createPlayer,
  selectCard,
  addToHand,
  removeFromHand,
  addPenaltyCards,
  calculateScore,
  hasCard,
  canSelectCard,
  type Player,
  type PlayerAction
} from '../player'
import { createCard, type Card } from '../card'

describe('Player functions', () => {
  describe('Player creation', () => {
    it('should create a player with initial state', () => {
      const player = createPlayer('Alice', 0)
      
      expect(player.name).toBe('Alice')
      expect(player.index).toBe(0)
      expect(player.hand).toEqual([])
      expect(player.penaltyCards).toEqual([])
      expect(player.selectedCard).toBeNull()
    })

    it('should create players with different indices', () => {
      const player1 = createPlayer('Alice', 0)
      const player2 = createPlayer('Bob', 1)
      
      expect(player1.index).toBe(0)
      expect(player2.index).toBe(1)
    })
  })

  describe('Hand management', () => {
    it('should add cards to hand', () => {
      const player = createPlayer('Alice', 0)
      const card1 = createCard(10)
      const card2 = createCard(20)
      
      const updated = addToHand(player, [card1, card2])
      
      expect(updated.hand).toEqual([card1, card2])
      expect(player.hand).toEqual([]) // Original unchanged
    })

    it('should remove a card from hand', () => {
      const card1 = createCard(10)
      const card2 = createCard(20)
      const card3 = createCard(30)
      const player = { ...createPlayer('Alice', 0), hand: [card1, card2, card3] }
      
      const updated = removeFromHand(player, card2)
      
      expect(updated.hand).toEqual([card1, card3])
      expect(player.hand).toEqual([card1, card2, card3]) // Original unchanged
    })

    it('should throw error when removing card not in hand', () => {
      const player = { ...createPlayer('Alice', 0), hand: [createCard(10)] }
      const notInHand = createCard(20)
      
      expect(() => removeFromHand(player, notInHand)).toThrow('Card not in hand')
    })

    it('should check if player has a specific card', () => {
      const card1 = createCard(10)
      const card2 = createCard(20)
      const player = { ...createPlayer('Alice', 0), hand: [card1, card2] }
      
      expect(hasCard(player, card1)).toBe(true)
      expect(hasCard(player, createCard(30))).toBe(false)
    })
  })

  describe('Card selection', () => {
    it('should select a card from hand', () => {
      const card1 = createCard(10)
      const card2 = createCard(20)
      const player = { ...createPlayer('Alice', 0), hand: [card1, card2] }
      
      const updated = selectCard(player, card1)
      
      expect(updated.selectedCard).toEqual(card1)
      expect(updated.hand).toEqual([card2]) // Card removed from hand
    })

    it('should throw error if selecting card not in hand', () => {
      const player = { ...createPlayer('Alice', 0), hand: [createCard(10)] }
      
      expect(() => selectCard(player, createCard(20))).toThrow('Cannot select card not in hand')
    })

    it('should throw error if card already selected', () => {
      const card1 = createCard(10)
      const player = { 
        ...createPlayer('Alice', 0), 
        hand: [card1, createCard(20)],
        selectedCard: createCard(30)
      }
      
      expect(() => selectCard(player, card1)).toThrow('Card already selected')
    })

    it('should check if player can select a card', () => {
      const card1 = createCard(10)
      const player = { ...createPlayer('Alice', 0), hand: [card1] }
      
      expect(canSelectCard(player, card1)).toBe(true)
      expect(canSelectCard(player, createCard(20))).toBe(false)
      
      const withSelected = { ...player, selectedCard: card1 }
      expect(canSelectCard(withSelected, card1)).toBe(false)
    })
  })

  describe('Penalty cards and scoring', () => {
    it('should add penalty cards', () => {
      const player = createPlayer('Alice', 0)
      const penalties = [createCard(10), createCard(55), createCard(11)]
      
      const updated = addPenaltyCards(player, penalties)
      
      expect(updated.penaltyCards).toEqual(penalties)
      expect(calculateScore(updated)).toBe(3 + 7 + 5) // 15 total bull heads
    })

    it('should accumulate penalty cards', () => {
      const player = createPlayer('Alice', 0)
      const firstBatch = [createCard(10), createCard(20)]
      const secondBatch = [createCard(30), createCard(40)]
      
      const after1 = addPenaltyCards(player, firstBatch)
      const after2 = addPenaltyCards(after1, secondBatch)
      
      expect(after2.penaltyCards).toEqual([...firstBatch, ...secondBatch])
      expect(calculateScore(after2)).toBe(3 + 3 + 3 + 3) // 12 total
    })

    it('should calculate score correctly', () => {
      const player = {
        ...createPlayer('Alice', 0),
        penaltyCards: [
          createCard(55), // 7 bull heads
          createCard(10), // 3 bull heads
          createCard(5),  // 2 bull heads
          createCard(1)   // 1 bull head
        ]
      }
      
      expect(calculateScore(player)).toBe(13)
    })

    it('should return 0 score for player with no penalty cards', () => {
      const player = createPlayer('Alice', 0)
      expect(calculateScore(player)).toBe(0)
    })
  })

  describe('Player actions', () => {
    it('should create a valid player action', () => {
      const card = createCard(25)
      const action: PlayerAction = {
        playerIndex: 0,
        card: card,
        chosenRow: undefined
      }
      
      expect(action.playerIndex).toBe(0)
      expect(action.card).toEqual(card)
      expect(action.chosenRow).toBeUndefined()
    })

    it('should create action with chosen row for too-low cards', () => {
      const action: PlayerAction = {
        playerIndex: 1,
        card: createCard(5),
        chosenRow: 2
      }
      
      expect(action.chosenRow).toBe(2)
    })
  })
})