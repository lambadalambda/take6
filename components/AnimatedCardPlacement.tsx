import React, { useEffect, useState, useRef } from 'react'
import { type Card as CardType } from '../engine/card'
import { Card } from './Card'

export type AnimatedCard = {
  card: CardType
  playerName: string
  targetRow: number
  targetPosition: number
}

export type AnimatedCardPlacementProps = {
  cards: AnimatedCard[]
  onAnimationComplete: () => void
  className?: string
}

type CardPhase = 'hidden' | 'appearing' | 'moving' | 'placed'

export const AnimatedCardPlacement: React.FC<AnimatedCardPlacementProps> = ({
  cards,
  onAnimationComplete,
  className = ''
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [cardPhase, setCardPhase] = useState<CardPhase>('hidden')
  const boardRef = useRef<DOMRect | null>(null)
  
  console.log('AnimatedCardPlacement render:', { cards, currentCardIndex, cardPhase })

  useEffect(() => {
    // Get board position for calculating target coordinates
    const updateBoardPosition = () => {
      const boardElement = document.querySelector('[data-testid="board"]')
      if (boardElement) {
        boardRef.current = boardElement.getBoundingClientRect()
      }
    }
    
    // Initial update
    updateBoardPosition()
    
    // Update on window resize
    window.addEventListener('resize', updateBoardPosition)
    return () => window.removeEventListener('resize', updateBoardPosition)
  }, [cards])

  useEffect(() => {
    if (cards.length === 0) {
      onAnimationComplete()
      return
    }

    // Animation sequence for each card
    const phases: { phase: CardPhase; duration: number }[] = [
      { phase: 'appearing', duration: 300 },
      { phase: 'moving', duration: 700 },
      { phase: 'placed', duration: 200 }
    ]

    let phaseIndex = 0
    const runPhase = () => {
      if (phaseIndex < phases.length) {
        setCardPhase(phases[phaseIndex].phase)
        setTimeout(() => {
          phaseIndex++
          runPhase()
        }, phases[phaseIndex].duration)
      } else {
        // Move to next card or complete
        if (currentCardIndex < cards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1)
          setCardPhase('hidden')
        } else {
          setTimeout(onAnimationComplete, 200)
        }
      }
    }

    runPhase()
  }, [currentCardIndex, cards, onAnimationComplete])

  if (cards.length === 0) return null
  
  // Wait a moment for board position to be captured
  if (!boardRef.current) {
    setTimeout(() => {
      const boardElement = document.querySelector('[data-testid="board"]')
      if (boardElement) {
        boardRef.current = boardElement.getBoundingClientRect()
      }
    }, 100)
    return null
  }

  const currentCard = cards[currentCardIndex]
  
  // Calculate target position based on row and position
  const getTargetPosition = () => {
    if (!boardRef.current) return { x: 0, y: 0 }
    
    const rowHeight = 180 // Approximate row height
    const cardWidth = 120 // Approximate card width with spacing
    const rowY = boardRef.current.top + (currentCard.targetRow * rowHeight) + 60
    const cardX = boardRef.current.left + 100 + (currentCard.targetPosition * cardWidth)
    
    return { x: cardX, y: rowY }
  }

  const target = getTargetPosition()

  const getCardStyle = () => {
    switch (cardPhase) {
      case 'hidden':
        return {
          left: '50%',
          top: '100%',
          transform: 'translate(-50%, 0) scale(0)',
          opacity: 0
        }
      case 'appearing':
        return {
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%) scale(1.3) rotateY(360deg)',
          opacity: 1
        }
      case 'moving':
        return {
          left: `${target.x}px`,
          top: `${target.y}px`,
          transform: 'translate(0, 0) scale(1)',
          opacity: 1
        }
      case 'placed':
        return {
          left: `${target.x}px`,
          top: `${target.y}px`,
          transform: 'translate(0, 0) scale(1)',
          opacity: 0
        }
      default:
        return {}
    }
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`.trim()}>
      <div
        className="absolute transition-all ease-in-out"
        style={{
          ...getCardStyle(),
          transitionDuration: cardPhase === 'moving' ? '700ms' : '300ms',
          transitionTimingFunction: cardPhase === 'moving' ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'ease-out'
        }}
      >
        <div className="relative">
          <Card card={currentCard.card} />
          <div className="absolute -bottom-10 left-0 right-0 text-center">
            <span className="text-sm font-bold bg-yellow-100 text-gray-800 px-3 py-1 rounded-full shadow-lg border border-yellow-300">
              {currentCard.playerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}