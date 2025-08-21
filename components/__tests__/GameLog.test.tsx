import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GameLog, type LogEntry } from '../GameLog'

describe('GameLog Component', () => {
  it('should show empty state when no entries', () => {
    render(<GameLog entries={[]} />)
    
    expect(screen.getByText('Game Log')).toBeInTheDocument()
    expect(screen.getByText('No actions yet this turn')).toBeInTheDocument()
  })

  it('should display placed card entries', () => {
    const entries: LogEntry[] = [
      { player: 'Alice', card: 45, action: 'placed', row: 2 },
      { player: 'Bob', card: 23, action: 'placed', row: 1 }
    ]
    
    render(<GameLog entries={entries} />)
    
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
    expect(screen.getByText(/45/)).toBeInTheDocument()
    expect(screen.getByText(/to row 2/)).toBeInTheDocument()
    
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
    expect(screen.getByText(/23/)).toBeInTheDocument()
    expect(screen.getByText(/to row 1/)).toBeInTheDocument()
  })

  it('should display took-row entries with penalty info', () => {
    const entries: LogEntry[] = [
      { 
        player: 'Charlie', 
        card: 5, 
        action: 'took-row', 
        row: 3,
        penaltyCards: 3,
        bullHeads: 7
      }
    ]
    
    render(<GameLog entries={entries} />)
    
    expect(screen.getByText(/Charlie/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
    expect(screen.getByText(/too low, took row 3/)).toBeInTheDocument()
    expect(screen.getByText(/3 cards, 7 bull heads/)).toBeInTheDocument()
  })

  it('should display sixth-card entries with penalty info', () => {
    const entries: LogEntry[] = [
      { 
        player: 'Diana', 
        card: 66, 
        action: 'sixth-card', 
        row: 2,
        penaltyCards: 5,
        bullHeads: 12
      }
    ]
    
    render(<GameLog entries={entries} />)
    
    expect(screen.getByText(/Diana/)).toBeInTheDocument()
    expect(screen.getByText(/66/)).toBeInTheDocument()
    expect(screen.getByText(/6th card, took row 2/)).toBeInTheDocument()
    expect(screen.getByText(/5 cards, 12 bull heads/)).toBeInTheDocument()
  })

  it('should highlight penalty entries differently', () => {
    const entries: LogEntry[] = [
      { player: 'Alice', card: 45, action: 'placed', row: 2 },
      { 
        player: 'Bob', 
        card: 5, 
        action: 'took-row', 
        row: 1,
        penaltyCards: 2,
        bullHeads: 5
      }
    ]
    
    render(<GameLog entries={entries} />)
    
    const logEntries = screen.getAllByText(/played/, { selector: 'div' })
    
    // First entry should have normal background
    expect(logEntries[0]).toHaveClass('bg-gray-50')
    
    // Second entry should have red background
    expect(logEntries[1]).toHaveClass('bg-red-50')
  })

  it('should show heading for last turn results', () => {
    const entries: LogEntry[] = [
      { player: 'Alice', card: 45, action: 'placed', row: 2 }
    ]
    
    render(<GameLog entries={entries} />)
    
    expect(screen.getByText('Last Turn Results')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<GameLog entries={[]} className="custom-log" />)
    
    const logElement = screen.getByText('Game Log').closest('div')
    expect(logElement).toHaveClass('custom-log')
  })

  it('should handle multiple entries in order', () => {
    const entries: LogEntry[] = [
      { player: 'Alice', card: 10, action: 'placed', row: 1 },
      { player: 'Bob', card: 20, action: 'placed', row: 1 },
      { player: 'Charlie', card: 30, action: 'placed', row: 2 },
      { player: 'Diana', card: 40, action: 'placed', row: 3 }
    ]
    
    render(<GameLog entries={entries} />)
    
    const allEntries = screen.getAllByText(/played/)
    expect(allEntries).toHaveLength(4)
    
    // Check order is preserved
    expect(allEntries[0]).toHaveTextContent('Alice played 10')
    expect(allEntries[1]).toHaveTextContent('Bob played 20')
    expect(allEntries[2]).toHaveTextContent('Charlie played 30')
    expect(allEntries[3]).toHaveTextContent('Diana played 40')
  })
})