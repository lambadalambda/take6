import React from 'react'
import { type Card as CardType } from '../engine/card'
import { Card } from './Card'

// Add breathing animation styles with 3D tilt - more exaggerated movement
const breathingStyles = `
  @keyframes breathe {
    0%, 100% {
      transform: var(--base-transform) translateY(0px) rotateX(0deg) rotateY(0deg);
    }
    25% {
      transform: var(--base-transform) translateY(-6px) rotateX(5deg) rotateY(-3deg);
    }
    50% {
      transform: var(--base-transform) translateY(0px) rotateX(-3deg) rotateY(3deg);
    }
    75% {
      transform: var(--base-transform) translateY(5px) rotateX(-5deg) rotateY(-3deg);
    }
  }
  
  .animate-breathe {
    animation: breathe 4s ease-in-out infinite;
    transform-style: preserve-3d;
  }
  
  .card-container {
    perspective: 1000px;
  }
`

export type PlayerHandProps = {
  cards: CardType[]
  onCardSelect?: (card: CardType) => void
  selectedCard?: CardType | null
  disabled?: boolean
  playerName?: string
  isAI?: boolean
  className?: string
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardSelect,
  selectedCard = null,
  disabled = false,
  playerName,
  isAI = false,
  className = ''
}) => {
  // Sort cards in ascending order
  const sortedCards = [...cards].sort((a, b) => a.number - b.number)

  const handleCardClick = (card: CardType) => {
    if (onCardSelect && !disabled) {
      onCardSelect(card)
    }
  }

  // Calculate arc positioning for each card
  const getCardStyle = (index: number, total: number) => {
    const middleIndex = (total - 1) / 2
    const offset = index - middleIndex
    const rotation = offset * 3 // degrees of rotation per card
    const yOffset = Math.abs(offset) * 3 // pixels to push down from center
    
    return {
      transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
      transformOrigin: 'bottom center',
      zIndex: index,
      // Stagger animation delays for organic feel
      animationDelay: `${index * 0.1}s`
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: breathingStyles }} />
      <div data-testid="player-hand" className={`${className}`.trim()}>
      {/* Cards */}
      {cards.length === 0 ? (
        <div className="text-white/40 text-center py-8">
          No cards in hand
        </div>
      ) : (
        <div className="relative flex justify-center items-end h-40 overflow-visible card-container">
          {sortedCards.map((card, index) => {
            const isSelected = selectedCard?.number === card.number
            const cardStyle = getCardStyle(index, sortedCards.length)
            const totalCards = sortedCards.length
            const spacing = Math.min(80, 600 / totalCards) // Dynamic spacing based on number of cards
            
            return (
              <div
                key={`${card.number}-${index}`}
                className={`
                  absolute transition-all duration-200 animate-breathe
                  ${isSelected ? '-translate-y-8' : 'hover:-translate-y-4'}
                `}
                style={{
                  ...cardStyle,
                  left: `calc(50% + ${(index - (totalCards - 1) / 2) * spacing}px)`,
                  marginLeft: '-61.6px', // Half of scaled card width (w-28 * 1.1 = 123.2px)
                  '--base-transform': cardStyle.transform,
                  zIndex: isSelected ? 100 : cardStyle.zIndex
                } as React.CSSProperties}
              >
                <div className="scale-100">
                  <Card
                    card={card}
                    onClick={onCardSelect ? () => handleCardClick(card) : undefined}
                    selected={isSelected}
                    disabled={disabled}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </>
  )
}