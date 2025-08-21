import {
  createGame,
  initializeRound,
  selectCardForPlayer,
  resolveRound,
  isRoundComplete,
  isGameOver,
  getWinner,
  getPlayerByIndex,
  getAllPlayersReady,
  needsRowSelection,
  type Game,
  type GameConfig
} from '../game'
import { createCard } from '../card'
import { createDeck } from '../deck'

describe('Game functions', () => {
  describe('Game creation', () => {
    it('should create a game with 4 players', () => {
      const config: GameConfig = {
        playerNames: ['Alice', 'Bob', 'Charlie', 'Diana']
      }
      const game = createGame(config)
      
      expect(game.players.length).toBe(4)
      expect(game.players[0].name).toBe('Alice')
      expect(game.players[1].name).toBe('Bob')
      expect(game.players[2].name).toBe('Charlie')
      expect(game.players[3].name).toBe('Diana')
      expect(game.currentRound).toBe(0)
      expect(game.board).toEqual([])
      expect(game.playerSelections).toEqual([])
    })

    it('should throw error for invalid number of players', () => {
      expect(() => createGame({ playerNames: ['Alice'] })).toThrow('Must have 2-10 players')
      expect(() => createGame({ playerNames: Array(11).fill('Player') })).toThrow('Must have 2-10 players')
    })
  })

  describe('Round initialization', () => {
    it('should initialize a new round', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      const initialized = initializeRound(game)
      
      expect(initialized.currentRound).toBe(1)
      expect(initialized.board.length).toBe(4) // 4 rows
      
      // Each player should have 10 cards
      initialized.players.forEach(player => {
        expect(player.hand.length).toBe(10)
      })
      
      // All 104 cards should be distributed (4 on board + 40 in hands = 44, rest in deck)
      const totalCards = initialized.players.reduce((sum, p) => sum + p.hand.length, 0) +
                        initialized.board.reduce((sum, row) => sum + row.length, 0)
      expect(totalCards).toBe(44) // 4 starting + 40 dealt
    })

    it('should deal unique cards to each player', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      const initialized = initializeRound(game)
      
      const allCardNumbers = new Set<number>()
      
      // Check board cards
      initialized.board.forEach(row => {
        row.forEach(card => {
          expect(allCardNumbers.has(card.number)).toBe(false)
          allCardNumbers.add(card.number)
        })
      })
      
      // Check player hands
      initialized.players.forEach(player => {
        player.hand.forEach(card => {
          expect(allCardNumbers.has(card.number)).toBe(false)
          allCardNumbers.add(card.number)
        })
      })
      
      expect(allCardNumbers.size).toBe(44)
    })
  })

  describe('Card selection', () => {
    it('should allow player to select a card', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      const initialized = initializeRound(game)
      
      const alice = initialized.players[0]
      const cardToSelect = alice.hand[0]
      
      const afterSelection = selectCardForPlayer(initialized, 0, cardToSelect)
      
      expect(afterSelection.players[0].selectedCard).toEqual(cardToSelect)
      expect(afterSelection.players[0].hand.length).toBe(9) // Card removed from hand
    })

    it('should throw error if player selects card not in hand', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      const initialized = initializeRound(game)
      
      // Find a card that's definitely not in player 0's hand
      const playerCards = new Set(initialized.players[0].hand.map(c => c.number))
      let notInHandNumber = 1
      while (playerCards.has(notInHandNumber) && notInHandNumber <= 104) {
        notInHandNumber++
      }
      
      // This card is guaranteed not to be in the player's hand
      const notInHand = createCard(notInHandNumber)
      
      expect(() => selectCardForPlayer(initialized, 0, notInHand))
        .toThrow('Cannot select card not in hand')
    })

    it('should check if all players are ready', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      let initialized = initializeRound(game)
      
      // Set up controlled state to avoid randomness
      initialized = {
        ...initialized,
        board: [
          [createCard(10)],
          [createCard(20)],
          [createCard(30)],
          [createCard(40)]
        ],
        players: initialized.players.map((p, i) => ({
          ...p,
          hand: [createCard(50 + i * 5), ...p.hand.slice(1)]
        }))
      }
      
      expect(getAllPlayersReady(initialized)).toBe(false)
      
      // Have all players select cards
      let current = initialized
      for (let i = 0; i < 4; i++) {
        const card = current.players[i].hand[0]
        current = selectCardForPlayer(current, i, card)
      }
      
      expect(getAllPlayersReady(current)).toBe(true)
    })
  })

  describe('Round resolution', () => {
    it('should resolve a round when all players have selected', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      let initialized = initializeRound(game)
      
      // Set up a controlled board state to avoid randomness issues
      initialized = {
        ...initialized,
        board: [
          [createCard(10)],
          [createCard(20)],
          [createCard(30)],
          [createCard(40)]
        ],
        players: initialized.players.map((p, i) => ({
          ...p,
          hand: [createCard(50 + i * 5), ...p.hand.slice(1)]  // Ensure cards are higher than board
        }))
      }
      
      // Have all players select cards
      let current = initialized
      for (let i = 0; i < 4; i++) {
        const card = current.players[i].hand[0]
        current = selectCardForPlayer(current, i, card)
      }
      
      const resolved = resolveRound(current)
      
      // All selected cards should be null again
      resolved.players.forEach(player => {
        expect(player.selectedCard).toBeNull()
      })
      
      // Board should have new cards
      const totalBoardCards = resolved.board.reduce((sum, row) => sum + row.length, 0)
      expect(totalBoardCards).toBe(8) // 4 starting + 4 placed
    })

    it('should handle penalty cards correctly', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      let initialized = initializeRound(game)
      
      // Manually set up a scenario where someone will take cards
      // Fill first row with 5 cards
      const board = initialized.board
      board[0] = [createCard(10), createCard(11), createCard(12), createCard(13), createCard(14)]
      initialized = { ...initialized, board }
      
      // Alice selects card 15 (will be 6th card, takes the row)
      initialized = { ...initialized, players: initialized.players.map((p, i) => 
        i === 0 ? { ...p, hand: [createCard(15)], selectedCard: null } : p
      )}
      initialized = selectCardForPlayer(initialized, 0, createCard(15))
      
      // Others select higher cards
      for (let i = 1; i < 4; i++) {
        const card = createCard(20 + i * 10)
        initialized = { ...initialized, players: initialized.players.map((p, idx) =>
          idx === i ? { ...p, hand: [card], selectedCard: null } : p
        )}
        initialized = selectCardForPlayer(initialized, i, card)
      }
      
      const resolved = resolveRound(initialized)
      
      // Alice should have penalty cards
      expect(resolved.players[0].penaltyCards.length).toBe(5)
      expect(resolved.players[1].penaltyCards.length).toBe(0)
    })

    it('should handle too-low cards with row selection', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      let initialized = initializeRound(game)
      
      // Set up board with high starting cards
      initialized = { ...initialized, board: [
        [createCard(50)],
        [createCard(60)],
        [createCard(70)],
        [createCard(80)]
      ]}
      
      // Alice plays a card too low for any row and chooses row 1
      const lowCard = createCard(5)
      initialized = { ...initialized, players: initialized.players.map((p, i) => 
        i === 0 ? { ...p, hand: [lowCard], selectedCard: null } : p
      )}
      
      // Alice needs to choose a row
      initialized = selectCardForPlayer(initialized, 0, lowCard, 1)
      expect(needsRowSelection(initialized, 0)).toBe(true)
      
      // Others play normal cards
      for (let i = 1; i < 4; i++) {
        const card = createCard(85 + i)
        initialized = { ...initialized, players: initialized.players.map((p, idx) =>
          idx === i ? { ...p, hand: [card], selectedCard: null } : p
        )}
        initialized = selectCardForPlayer(initialized, i, card)
      }
      
      const resolved = resolveRound(initialized)
      
      // Alice should have taken row 1's cards
      expect(resolved.players[0].penaltyCards).toEqual([createCard(60)])
      expect(resolved.board[1]).toEqual([createCard(5)])
    })

    it('should throw error if trying to resolve without all players ready', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      const initialized = initializeRound(game)
      
      // Only Alice selects
      const withOneSelection = selectCardForPlayer(initialized, 0, initialized.players[0].hand[0])
      
      expect(() => resolveRound(withOneSelection)).toThrow('Not all players have selected cards')
    })
  })

  describe('Round completion', () => {
    it('should detect when round is complete', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      const initialized = initializeRound(game)
      
      expect(isRoundComplete(initialized)).toBe(false)
      
      // Manually empty all hands
      const emptyHands = {
        ...initialized,
        players: initialized.players.map(p => ({ ...p, hand: [] }))
      }
      
      expect(isRoundComplete(emptyHands)).toBe(true)
    })
  })

  describe('Game over conditions', () => {
    it('should detect game over when someone reaches 66 points', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      
      expect(isGameOver(game)).toBe(false)
      
      // Give Alice 66 points worth of penalty cards
      const withHighScore = {
        ...game,
        players: game.players.map((p, i) => 
          i === 0 ? { ...p, penaltyCards: Array(66).fill(createCard(1)) } : p
        )
      }
      
      expect(isGameOver(withHighScore)).toBe(true)
    })

    it('should find the winner (lowest score)', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      
      const withScores = {
        ...game,
        players: [
          { ...game.players[0], penaltyCards: Array(20).fill(createCard(1)) }, // 20 points
          { ...game.players[1], penaltyCards: Array(10).fill(createCard(1)) }, // 10 points (winner)
          { ...game.players[2], penaltyCards: Array(30).fill(createCard(1)) }, // 30 points
          { ...game.players[3], penaltyCards: Array(15).fill(createCard(1)) }  // 15 points
        ]
      }
      
      const winner = getWinner(withScores)
      expect(winner?.name).toBe('Bob')
      expect(winner?.index).toBe(1)
    })

    it('should handle tie for winner', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      
      const withTie = {
        ...game,
        players: [
          { ...game.players[0], penaltyCards: Array(10).fill(createCard(1)) }, // 10 points (tied)
          { ...game.players[1], penaltyCards: Array(10).fill(createCard(1)) }, // 10 points (tied, but first)
          { ...game.players[2], penaltyCards: Array(30).fill(createCard(1)) }, // 30 points
          { ...game.players[3], penaltyCards: Array(15).fill(createCard(1)) }  // 15 points
        ]
      }
      
      const winner = getWinner(withTie)
      expect(winner?.name).toBe('Alice') // First player with lowest score
    })
  })

  describe('Helper functions', () => {
    it('should get player by index', () => {
      const game = createGame({ playerNames: ['Alice', 'Bob', 'Charlie', 'Diana'] })
      
      expect(getPlayerByIndex(game, 0)?.name).toBe('Alice')
      expect(getPlayerByIndex(game, 2)?.name).toBe('Charlie')
      expect(getPlayerByIndex(game, 4)).toBeUndefined()
      expect(getPlayerByIndex(game, -1)).toBeUndefined()
    })
  })
})