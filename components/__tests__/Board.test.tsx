import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Board } from '../Board'
import { createCard } from '../../engine/card'
import { type Board as BoardType } from '../../engine/board'

describe('Board Component', () => {
  const sampleBoard: BoardType = [
    [createCard(10), createCard(15), createCard(18)],
    [createCard(20)],
    [createCard(30), createCard(35)],
    [createCard(40), createCard(45), createCard(48), createCard(49), createCard(50)]
  ]

  it('should render 4 rows', () => {
    render(<Board board={sampleBoard} />)
    
    const rows = screen.getAllByTestId(/^row-\d$/)
    expect(rows).toHaveLength(4)
  })

  it('should display all cards in each row', () => {
    render(<Board board={sampleBoard} />)
    
    // Row 0: 3 cards
    const row0 = screen.getByTestId('row-0')
    expect(row0.querySelectorAll('[data-testid="card"]')).toHaveLength(3)
    
    // Row 1: 1 card
    const row1 = screen.getByTestId('row-1')
    expect(row1.querySelectorAll('[data-testid="card"]')).toHaveLength(1)
    
    // Row 2: 2 cards
    const row2 = screen.getByTestId('row-2')
    expect(row2.querySelectorAll('[data-testid="card"]')).toHaveLength(2)
    
    // Row 3: 5 cards (full)
    const row3 = screen.getByTestId('row-3')
    expect(row3.querySelectorAll('[data-testid="card"]')).toHaveLength(5)
  })

  it('should show row numbers', () => {
    render(<Board board={sampleBoard} />)
    
    expect(screen.getByText('Row 1')).toBeInTheDocument()
    expect(screen.getByText('Row 2')).toBeInTheDocument()
    expect(screen.getByText('Row 3')).toBeInTheDocument()
    expect(screen.getByText('Row 4')).toBeInTheDocument()
  })

  it('should highlight full rows', () => {
    render(<Board board={sampleBoard} />)
    
    const row3 = screen.getByTestId('row-3')
    expect(row3).toHaveClass('bg-yellow-50')
  })

  it('should show empty slots for non-full rows', () => {
    render(<Board board={sampleBoard} />)
    
    // Row 1 should have 4 empty slots (1 card + 4 empty = 5 total)
    const row1 = screen.getByTestId('row-1')
    const emptySlots = row1.querySelectorAll('[data-testid="empty-slot"]')
    expect(emptySlots).toHaveLength(4)
  })

  it('should handle empty board', () => {
    const emptyBoard: BoardType = [[], [], [], []]
    render(<Board board={emptyBoard} />)
    
    const rows = screen.getAllByTestId(/^row-\d$/)
    expect(rows).toHaveLength(4)
    
    // Each row should have 5 empty slots
    rows.forEach(row => {
      const emptySlots = row.querySelectorAll('[data-testid="empty-slot"]')
      expect(emptySlots).toHaveLength(5)
    })
  })

  it('should show bull head total for each row', () => {
    render(<Board board={sampleBoard} />)
    
    // Row 0: cards 10(3) + 15(2) + 18(1) = 6 bull heads
    expect(screen.getByTestId('row-0-bullheads')).toHaveTextContent('6')
    
    // Row 1: card 20(3) = 3 bull heads
    expect(screen.getByTestId('row-1-bullheads')).toHaveTextContent('3')
    
    // Row 2: cards 30(3) + 35(2) = 5 bull heads
    expect(screen.getByTestId('row-2-bullheads')).toHaveTextContent('5')
    
    // Row 3: cards 40(3) + 45(2) + 48(1) + 49(1) + 50(3) = 10 bull heads
    expect(screen.getByTestId('row-3-bullheads')).toHaveTextContent('10')
  })

  it('should apply custom className', () => {
    render(<Board board={sampleBoard} className="custom-board-class" />)
    
    const boardElement = screen.getByTestId('board')
    expect(boardElement).toHaveClass('custom-board-class')
  })
})