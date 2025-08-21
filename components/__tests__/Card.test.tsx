import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card } from '../Card'
import { createCard } from '../../engine/card'

describe('Card Component', () => {
  it('should display card number', () => {
    const card = createCard(42)
    render(<Card card={card} />)
    
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display bull heads', () => {
    const card = createCard(55) // 7 bull heads
    render(<Card card={card} />)
    
    // Should show 7 bull head icons
    const bullHeads = screen.getAllByTestId('bull-head')
    expect(bullHeads).toHaveLength(7)
  })

  it('should handle click when onClick provided', () => {
    const card = createCard(10)
    const handleClick = jest.fn()
    
    render(<Card card={card} onClick={handleClick} />)
    
    const cardElement = screen.getByTestId('card')
    fireEvent.click(cardElement)
    
    expect(handleClick).toHaveBeenCalledWith(card)
  })

  it('should not be clickable when onClick not provided', () => {
    const card = createCard(10)
    
    render(<Card card={card} />)
    
    const cardElement = screen.getByTestId('card')
    expect(cardElement).not.toHaveClass('cursor-pointer')
  })

  it('should show selected state', () => {
    const card = createCard(10)
    
    render(<Card card={card} selected={true} />)
    
    const cardElement = screen.getByTestId('card')
    expect(cardElement).toHaveClass('ring-4')
  })

  it('should show disabled state', () => {
    const card = createCard(10)
    const handleClick = jest.fn()
    
    render(<Card card={card} onClick={handleClick} disabled={true} />)
    
    const cardElement = screen.getByTestId('card')
    fireEvent.click(cardElement)
    
    expect(handleClick).not.toHaveBeenCalled()
    expect(cardElement).toHaveClass('opacity-50')
  })

  it('should apply custom className', () => {
    const card = createCard(10)
    
    render(<Card card={card} className="custom-class" />)
    
    const cardElement = screen.getByTestId('card')
    expect(cardElement).toHaveClass('custom-class')
  })
})