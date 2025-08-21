import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ScoreBoard } from '../ScoreBoard'
import { type Player } from '../../engine/player'
import { createCard } from '../../engine/card'

describe('ScoreBoard Component', () => {
  const samplePlayers: Player[] = [
    {
      name: 'Alice',
      index: 0,
      hand: [],
      penaltyCards: [createCard(10), createCard(20), createCard(30)], // 9 bull heads
      selectedCard: null,
      chosenRow: undefined
    },
    {
      name: 'Bob',
      index: 1,
      hand: [],
      penaltyCards: [createCard(55), createCard(11)], // 12 bull heads
      selectedCard: null,
      chosenRow: undefined
    },
    {
      name: 'Charlie',
      index: 2,
      hand: [],
      penaltyCards: [], // 0 bull heads
      selectedCard: null,
      chosenRow: undefined
    },
    {
      name: 'Diana',
      index: 3,
      hand: [],
      penaltyCards: [createCard(5), createCard(15), createCard(25), createCard(35)], // 8 bull heads
      selectedCard: null,
      chosenRow: undefined
    }
  ]

  it('should display all player names', () => {
    render(<ScoreBoard players={samplePlayers} />)
    
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
    expect(screen.getByText('Diana')).toBeInTheDocument()
  })

  it('should display penalty points for each player', () => {
    render(<ScoreBoard players={samplePlayers} />)
    
    // Alice: 10(3) + 20(3) + 30(3) = 9 points
    expect(screen.getByTestId('score-0')).toHaveTextContent('9')
    // Bob: 55(7) + 11(5) = 12 points
    expect(screen.getByTestId('score-1')).toHaveTextContent('12')
    // Charlie: 0 points
    expect(screen.getByTestId('score-2')).toHaveTextContent('0')
    // Diana: 5(2) + 15(2) + 25(2) + 35(2) = 8 points
    expect(screen.getByTestId('score-3')).toHaveTextContent('8')
  })

  it('should highlight current player', () => {
    render(<ScoreBoard players={samplePlayers} currentPlayerIndex={1} />)
    
    const bobRow = screen.getByTestId('player-row-1')
    expect(bobRow).toHaveClass('bg-blue-100')
  })

  it('should mark leader with lowest score', () => {
    render(<ScoreBoard players={samplePlayers} />)
    
    // Charlie has 0 points (lowest)
    const charlieRow = screen.getByTestId('player-row-2')
    expect(charlieRow.querySelector('[data-testid="leader-badge"]')).toBeInTheDocument()
  })

  it('should show warning for players near 66 points', () => {
    const playersNearLimit: Player[] = [
      {
        ...samplePlayers[0],
        penaltyCards: Array(60).fill(createCard(1)) // 60 points
      }
    ]
    
    render(<ScoreBoard players={playersNearLimit} />)
    
    const warningIcon = screen.getByTestId('warning-0')
    expect(warningIcon).toBeInTheDocument()
  })

  it('should sort players by score when sortByScore is true', () => {
    render(<ScoreBoard players={samplePlayers} sortByScore={true} />)
    
    const playerRows = screen.getAllByTestId(/^player-row-/)
    // Should be sorted: Charlie (0), Diana (8), Alice (9), Bob (12)
    expect(playerRows[0]).toHaveTextContent('Charlie')
    expect(playerRows[1]).toHaveTextContent('Diana')
    expect(playerRows[2]).toHaveTextContent('Alice')
    expect(playerRows[3]).toHaveTextContent('Bob')
  })

  it('should show round number', () => {
    render(<ScoreBoard players={samplePlayers} currentRound={3} />)
    
    expect(screen.getByText('Round 3')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<ScoreBoard players={samplePlayers} className="custom-scoreboard" />)
    
    const scoreboardElement = screen.getByTestId('scoreboard')
    expect(scoreboardElement).toHaveClass('custom-scoreboard')
  })

  it('should handle empty players array', () => {
    render(<ScoreBoard players={[]} />)
    
    expect(screen.getByText('No players')).toBeInTheDocument()
  })
})