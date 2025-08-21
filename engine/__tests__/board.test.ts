import {
  createBoard,
  getRowForCard,
  canPlaceInRow,
  placeCard,
  takeRow,
  processCardPlacements,
  getRowCards,
  isRowFull,
  type Board,
  type PlacementResult,
  type CardPlacement
} from '../board'
import { createCard, type Card } from '../card'

describe('Board functions', () => {
  describe('Board creation', () => {
    it('should create a board with 4 rows', () => {
      const startingCards = [
        createCard(10),
        createCard(20),
        createCard(30),
        createCard(40)
      ]
      const board = createBoard(startingCards)
      
      expect(getRowCards(board, 0)).toEqual([createCard(10)])
      expect(getRowCards(board, 1)).toEqual([createCard(20)])
      expect(getRowCards(board, 2)).toEqual([createCard(30)])
      expect(getRowCards(board, 3)).toEqual([createCard(40)])
    })

    it('should throw error if not exactly 4 starting cards', () => {
      expect(() => createBoard([createCard(1), createCard(2)])).toThrow('Must have exactly 4 starting cards')
      expect(() => createBoard([createCard(1), createCard(2), createCard(3), createCard(4), createCard(5)])).toThrow('Must have exactly 4 starting cards')
    })
  })

  describe('Row management', () => {
    it('should check if a row is full', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      expect(isRowFull(board, 0)).toBe(false)
      
      // Add 4 more cards to row 0 to make it full
      let updatedBoard = board
      updatedBoard = placeCard(updatedBoard, 0, createCard(15)).board
      updatedBoard = placeCard(updatedBoard, 0, createCard(16)).board
      updatedBoard = placeCard(updatedBoard, 0, createCard(17)).board
      updatedBoard = placeCard(updatedBoard, 0, createCard(18)).board
      
      expect(isRowFull(updatedBoard, 0)).toBe(true)
    })

    it('should get cards from a specific row', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      let updatedBoard = placeCard(board, 1, createCard(25)).board
      updatedBoard = placeCard(updatedBoard, 1, createCard(27)).board
      
      const row1Cards = getRowCards(updatedBoard, 1)
      expect(row1Cards).toEqual([
        createCard(20),
        createCard(25),
        createCard(27)
      ])
    })
  })

  describe('Card placement rules', () => {
    it('should find the correct row for a card', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      expect(getRowForCard(board, createCard(25))).toBe(1) // Goes after 20
      expect(getRowForCard(board, createCard(35))).toBe(2) // Goes after 30
      expect(getRowForCard(board, createCard(45))).toBe(3) // Goes after 40
      expect(getRowForCard(board, createCard(15))).toBe(0) // Goes after 10
    })

    it('should return -1 for cards too low for any row', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      expect(getRowForCard(board, createCard(5))).toBe(-1)
      expect(getRowForCard(board, createCard(1))).toBe(-1)
    })

    it('should check if a card can be placed in a row', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      expect(canPlaceInRow(board, 0, createCard(15))).toBe(true)
      expect(canPlaceInRow(board, 0, createCard(5))).toBe(false) // Too low
      expect(canPlaceInRow(board, 1, createCard(25))).toBe(true)
      
      // Fill up row 0
      let fullBoard = board
      for (let i = 11; i <= 14; i++) {
        fullBoard = placeCard(fullBoard, 0, createCard(i)).board
      }
      
      expect(canPlaceInRow(fullBoard, 0, createCard(15))).toBe(false) // Row is full
    })
  })

  describe('Placing cards', () => {
    it('should place a card in a row', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      const result = placeCard(board, 0, createCard(15))
      
      expect(result.takenCards).toEqual([])
      expect(getRowCards(result.board, 0)).toEqual([createCard(10), createCard(15)])
    })

    it('should take row when placing 6th card', () => {
      let board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      // Fill row 0 with 4 more cards (total 5)
      board = placeCard(board, 0, createCard(11)).board
      board = placeCard(board, 0, createCard(12)).board
      board = placeCard(board, 0, createCard(13)).board
      board = placeCard(board, 0, createCard(14)).board
      
      // 6th card should take the row
      const result = placeCard(board, 0, createCard(15))
      
      expect(result.takenCards).toEqual([
        createCard(10),
        createCard(11),
        createCard(12),
        createCard(13),
        createCard(14)
      ])
      expect(getRowCards(result.board, 0)).toEqual([createCard(15)])
    })
  })

  describe('Taking rows', () => {
    it('should allow taking any row when card is too low', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      // Add some cards to different rows
      let updatedBoard = placeCard(board, 0, createCard(11)).board
      updatedBoard = placeCard(updatedBoard, 1, createCard(21)).board
      updatedBoard = placeCard(updatedBoard, 1, createCard(22)).board
      
      // Take row 1 with a low card
      const result = takeRow(updatedBoard, 1, createCard(5))
      
      expect(result.takenCards).toEqual([
        createCard(20),
        createCard(21),
        createCard(22)
      ])
      expect(getRowCards(result.board, 1)).toEqual([createCard(5)])
    })
  })

  describe('Processing multiple card placements', () => {
    it('should process cards in ascending order', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      const placements: CardPlacement[] = [
        { card: createCard(25), playerIndex: 0 },
        { card: createCard(15), playerIndex: 1 },
        { card: createCard(35), playerIndex: 2 },
        { card: createCard(45), playerIndex: 3 }
      ]
      
      const results = processCardPlacements(board, placements)
      
      // Should process in order: 15, 25, 35, 45
      expect(results.length).toBe(4)
      expect(results[0].card.number).toBe(15)
      expect(results[0].rowIndex).toBe(0)
      expect(results[1].card.number).toBe(25)
      expect(results[1].rowIndex).toBe(1)
      expect(results[2].card.number).toBe(35)
      expect(results[2].rowIndex).toBe(2)
      expect(results[3].card.number).toBe(45)
      expect(results[3].rowIndex).toBe(3)
      
      // Check final board state
      expect(getRowCards(results[3].newBoard, 0)).toEqual([createCard(10), createCard(15)])
      expect(getRowCards(results[3].newBoard, 1)).toEqual([createCard(20), createCard(25)])
      expect(getRowCards(results[3].newBoard, 2)).toEqual([createCard(30), createCard(35)])
      expect(getRowCards(results[3].newBoard, 3)).toEqual([createCard(40), createCard(45)])
    })

    it('should handle cards that are too low', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      const placements: CardPlacement[] = [
        { card: createCard(5), playerIndex: 0, chosenRow: 2 }, // Too low, choose row 2
        { card: createCard(25), playerIndex: 1 }
      ]
      
      const results = processCardPlacements(board, placements)
      
      expect(results[0].takenCards).toEqual([createCard(30)])
      expect(results[0].rowIndex).toBe(2)
      expect(getRowCards(results[0].newBoard, 2)).toEqual([createCard(5)])
      
      // Second card goes after 20
      expect(results[1].rowIndex).toBe(1)
      expect(getRowCards(results[1].newBoard, 1)).toEqual([createCard(20), createCard(25)])
    })

    it('should handle 6th card rule during processing', () => {
      let board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      // Fill row 0 with 4 cards (total 5)
      board = placeCard(board, 0, createCard(11)).board
      board = placeCard(board, 0, createCard(12)).board
      board = placeCard(board, 0, createCard(13)).board
      board = placeCard(board, 0, createCard(14)).board
      
      const placements: CardPlacement[] = [
        { card: createCard(15), playerIndex: 0 }, // Will be 6th card
        { card: createCard(25), playerIndex: 1 }
      ]
      
      const results = processCardPlacements(board, placements)
      
      // First placement should take the row
      expect(results[0].takenCards.length).toBe(5)
      expect(getRowCards(results[0].newBoard, 0)).toEqual([createCard(15)])
      
      // Second placement goes normally
      expect(results[1].rowIndex).toBe(1)
    })

    it('should throw error if no row chosen for too-low card', () => {
      const board = createBoard([createCard(10), createCard(20), createCard(30), createCard(40)])
      
      const placements: CardPlacement[] = [
        { card: createCard(5), playerIndex: 0 } // No chosenRow specified
      ]
      
      expect(() => processCardPlacements(board, placements)).toThrow('Must choose a row for card too low')
    })
  })
})