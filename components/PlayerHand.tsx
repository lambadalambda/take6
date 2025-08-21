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

  return (
    <div data-testid="player-hand" className={`p-4 bg-gray-50 rounded-lg ${className}`.trim()}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
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
        <div className="flex flex-wrap gap-3">
          {sortedCards.map((card, index) => (
            <Card
              key={`${card.number}-${index}`}
              card={card}
              onClick={onCardSelect ? () => handleCardClick(card) : undefined}
              selected={selectedCard?.number === card.number}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}