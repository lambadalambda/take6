import React, { useEffect, useState } from 'react'
import { type Card as CardType } from '../engine/card'
import { Card } from './Card'
import { type PlayerSelection } from '../engine/game'
import { type Board } from '../engine/board'
import { getRowForCard } from '../engine/board'

export type CardRevealOverlayProps = {
  selections: PlayerSelection[]
  playerNames: string[]
  board: Board
  onComplete: () => void
}

export const CardRevealOverlay: React.FC<CardRevealOverlayProps> = ({
  selections,
  playerNames,
  board,
  onComplete
}) => {
  const [phase, setPhase] = useState<'showing' | 'animating' | 'done'>('showing')
  const [currentCardIndex, setCurrentCardIndex] = useState(-1)
  const [cardPositions, setCardPositions] = useState<{ [key: number]: { x: number; y: number } }>({})
  
  // Sort selections by card number
  const sortedSelections = [...selections].sort((a, b) => a.card.number - b.card.number)
  
  useEffect(() => {
    // Calculate target positions for each card on the board
    const boardElement = document.querySelector('[data-testid="board"]')
    
    if (boardElement) {
      const boardRect = boardElement.getBoundingClientRect()
      const positions: { [key: number]: { x: number; y: number } } = {}
      
      sortedSelections.forEach((selection, index) => {
        // Calculate which row this card will go to
        const targetRow = getRowForCard(board, selection.card)
        const rowIndex = targetRow === -1 ? (selection.chosenRow || 0) : targetRow
        
        // Count how many cards are already in that row to determine position
        const cardsInRow = board[rowIndex]?.length || 0
        
        // Calculate position, then offset by half card size to center it
        // Normal card is w-28 h-40 (112px x 160px), scaled to 0.7 = 78.4px x 112px
        const baseX = boardRect.left + 60 + (cardsInRow * 90)
        const baseY = boardRect.top + (rowIndex * 135) + 20
        
        positions[index] = {
          x: baseX - 39, // Subtract half of scaled width (78.4/2 ≈ 39)
          y: baseY - 56  // Subtract half of scaled height (112/2 = 56)
        }
      })
      
      setCardPositions(positions)
    }
    
    // Start animation sequence
    const timer1 = setTimeout(() => {
      setPhase('animating')
      setCurrentCardIndex(0)
    }, 2000)
    
    return () => clearTimeout(timer1)
  }, [])
  
  useEffect(() => {
    if (phase === 'animating' && currentCardIndex >= 0) {
      if (currentCardIndex < sortedSelections.length - 1) {
        const timer = setTimeout(() => {
          setCurrentCardIndex(currentCardIndex + 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        // All cards animated, complete immediately
        const timer = setTimeout(() => {
          setPhase('done')
          onComplete()
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [phase, currentCardIndex, sortedSelections.length, onComplete])
  
  if (phase === 'done') return null
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      {phase === 'showing' && (
        <div className="flex gap-6">
          {sortedSelections.map((selection, index) => (
            <div key={index} className="flex flex-col items-center gap-2 animate-pulse">
              <Card card={selection.card} />
              <div className="bg-white px-3 py-1 rounded-full text-sm font-bold">
                {playerNames[selection.playerIndex]}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {phase === 'animating' && (
        <div className="absolute inset-0">
          {sortedSelections.map((selection, index) => {
            const isAnimating = index <= currentCardIndex
            const target = cardPositions[index] || { x: 0, y: 0 }
            
            return (
              <div
                key={index}
                className={`absolute transition-all duration-700 ${
                  isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: isAnimating ? `${target.x}px` : '50%',
                  top: isAnimating ? `${target.y}px` : '50%',
                  transform: isAnimating ? 'translate(0, 0) scale(0.7)' : 'translate(-50%, -50%) scale(1)',
                }}
              >
                <Card card={selection.card} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}