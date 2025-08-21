import React from 'react'
import { type Card as CardType } from '../engine/card'
import { Card } from './Card'

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
      zIndex: index
    }
  }

  return (
    <div data-testid="player-hand" className={`p-6 bg-gray-50 rounded-lg ${className}`.trim()}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          {playerName ? `${playerName}'s Hand${isAI ? ' (AI)' : ''}` : 'Your Hand'}
        </h3>
        <span className="text-sm text-gray-600">
          {cards.length > 0 ? `${cards.length} cards` : ''}
        </span>
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No cards in hand
        </div>
      ) : (
        <div className="relative flex justify-center items-end h-52 overflow-visible">
          {sortedCards.map((card, index) => {
            const isSelected = selectedCard?.number === card.number
            const cardStyle = getCardStyle(index, sortedCards.length)
            const totalCards = sortedCards.length
            const spacing = Math.min(80, 600 / totalCards) // Dynamic spacing based on number of cards
            
            return (
              <div
                key={`${card.number}-${index}`}
                className={`
                  absolute transition-all duration-200 
                  ${isSelected ? '-translate-y-8 z-50' : 'hover:-translate-y-4 hover:z-40'}
                `}
                style={{
                  ...cardStyle,
                  left: `calc(50% + ${(index - (totalCards - 1) / 2) * spacing}px)`,
                  marginLeft: '-61.6px' // Half of scaled card width (w-28 * 1.1 = 123.2px)
                }}
              >
                <div className="scale-110">
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
  )
}