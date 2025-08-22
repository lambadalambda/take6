import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PlayerHand } from '../PlayerHand'
import { createCard } from '../../engine/card'
import { type Card } from '../../engine/card'

describe('PlayerHand Component', () => {
  const sampleHand: Card[] = [
    createCard(5),
    createCard(15),
    createCard(25),
    createCard(35),
    createCard(45),
    createCard(55),
    createCard(65),
    createCard(75),
    createCard(85),
    createCard(95)
  ]

  it('should display all cards in hand', () => {
    render(<PlayerHand cards={sampleHand} />)
    
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(10)
  })

  it('should display cards in ascending order', () => {
    const unorderedHand = [
      createCard(50),
      createCard(10),
      createCard(30),
      createCard(20),
      createCard(40)
    ]
    
    render(<PlayerHand cards={unorderedHand} />)
    
    const cards = screen.getAllByTestId('card')
    expect(cards[0]).toHaveTextContent('10')
    expect(cards[1]).toHaveTextContent('20')
    expect(cards[2]).toHaveTextContent('30')
    expect(cards[3]).toHaveTextContent('40')
    expect(cards[4]).toHaveTextContent('50')
  })

  it('should handle card selection', () => {
    const handleSelect = jest.fn()
    render(<PlayerHand cards={sampleHand} onCardSelect={handleSelect} />)
    
    const firstCard = screen.getAllByTestId('card')[0]
    fireEvent.click(firstCard)
    
    expect(handleSelect).toHaveBeenCalledWith(createCard(5))
  })

  it('should highlight selected card', () => {
    render(<PlayerHand cards={sampleHand} selectedCard={createCard(25)} />)
    
    const cards = screen.getAllByTestId('card')
    expect(cards[2]).toHaveClass('selected-card-border')
  })

  it('should disable all cards when disabled', () => {
    const handleSelect = jest.fn()
    render(
      <PlayerHand 
        cards={sampleHand} 
        onCardSelect={handleSelect}
        disabled={true}
      />
    )
    
    const firstCard = screen.getAllByTestId('card')[0]
    fireEvent.click(firstCard)
    
    expect(handleSelect).not.toHaveBeenCalled()
    expect(firstCard).toHaveClass('opacity-50')
  })

  it.skip('should show player name - feature removed', () => {
    // Player name display was removed from the UI
    render(<PlayerHand cards={sampleHand} playerName="Alice" />)
    
    expect(screen.getByText("Alice's Hand")).toBeInTheDocument()
  })

  it.skip('should show card count - feature removed', () => {
    // Card count display was removed from the UI
    render(<PlayerHand cards={sampleHand} />)
    
    expect(screen.getByText('10 cards')).toBeInTheDocument()
  })

  it('should handle empty hand', () => {
    render(<PlayerHand cards={[]} />)
    
    expect(screen.getByText('No cards in hand')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<PlayerHand cards={sampleHand} className="custom-hand" />)
    
    const handElement = screen.getByTestId('player-hand')
    expect(handElement).toHaveClass('custom-hand')
  })

  it.skip('should show as AI player when isAI is true - feature removed', () => {
    // AI player label was removed from the UI
    render(<PlayerHand cards={sampleHand} playerName="Bot1" isAI={true} />)
    
    expect(screen.getByText('Bot1\'s Hand (AI)')).toBeInTheDocument()
  })
})