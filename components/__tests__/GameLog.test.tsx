import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { GameLog, type LogEntry } from '../GameLog'

describe('GameLog Component', () => {
  it('should show empty state when no entries', () => {
    render(<GameLog entries={[]} />)
    
    expect(screen.getByText('Log')).toBeInTheDocument()
    expect(screen.getByText('No actions yet')).toBeInTheDocument()
  })

  it('should display placed card entries', () => {
    const entries: LogEntry[] = [
      { player: 'Alice', card: 45, action: 'placed', row: 2 },
      { player: 'Bob', card: 23, action: 'placed', row: 1 }
    ]
    
    render(<GameLog entries={entries} />)
    
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
    expect(screen.getByText(/45/)).toBeInTheDocument()
    expect(screen.getByText(/→ R2/)).toBeInTheDocument()
    
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
    expect(screen.getByText(/23/)).toBeInTheDocument()
    expect(screen.getByText(/→ R1/)).toBeInTheDocument()
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
    expect(screen.getByText(/✗ took R3/)).toBeInTheDocument()
    expect(screen.getByText(/7🐮/)).toBeInTheDocument()
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
    expect(screen.getByText(/✗ 6th card R2/)).toBeInTheDocument()
    expect(screen.getByText(/12🐮/)).toBeInTheDocument()
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
    
    const container = screen.getByText('Last Turn').parentElement
    const logEntries = container?.querySelectorAll('.text-xs.p-2.rounded')
    
    // First entry should have normal background
    expect(logEntries?.[0]).toHaveClass('bg-white/10')
    
    // Second entry should have red background
    expect(logEntries?.[1]).toHaveClass('bg-red-500/20')
  })

  it('should show heading for last turn results', () => {
    const entries: LogEntry[] = [
      { player: 'Alice', card: 45, action: 'placed', row: 2 }
    ]
    
    render(<GameLog entries={entries} />)
    
    expect(screen.getByText('Last Turn')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<GameLog entries={[]} className="custom-log" />)
    
    const logElement = screen.getByText('Log').closest('div')
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
    
    // Check all player names are present
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
    expect(screen.getByText(/Charlie/)).toBeInTheDocument()
    expect(screen.getByText(/Diana/)).toBeInTheDocument()
    
    // Check all cards are shown
    expect(screen.getByText(/10/)).toBeInTheDocument()
    expect(screen.getByText(/20/)).toBeInTheDocument()
    expect(screen.getByText(/30/)).toBeInTheDocument()
    expect(screen.getByText(/40/)).toBeInTheDocument()
  })
})