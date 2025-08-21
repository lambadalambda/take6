import React from 'react'
import { type Card as CardType } from '../engine/card'

export type CardProps = {
  card: CardType
  onClick?: (card: CardType) => void
  selected?: boolean
  disabled?: boolean
  className?: string
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  selected = false, 
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(card)
    }
  }

  const baseClasses = 'relative bg-white border-2 border-gray-800 rounded-lg p-4 shadow-md transition-all'
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
  const selectedClasses = selected ? 'ring-4 ring-blue-500' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <div
      data-testid="card"
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} ${className}`.trim()}
      onClick={handleClick}
    >
      <div className="text-2xl font-bold text-center mb-2">
        {card.number}
      </div>
      <div className="flex justify-center gap-1 flex-wrap">
        {Array.from({ length: card.bullHeads }).map((_, i) => (
          <span key={i} data-testid="bull-head" className="text-red-600">
            🐂
          </span>
        ))}
      </div>
    </div>
  )
}