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

  const baseClasses = 'relative bg-white border-2 border-gray-800 rounded-lg shadow-md transition-all w-28 h-40'
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
  const selectedClasses = selected ? 'ring-4 ring-blue-500' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <div
      data-testid="card"
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} ${className}`.trim()}
      onClick={handleClick}
    >
      {/* Corner numbers */}
      <div className="absolute top-1 left-1 text-xs font-bold -rotate-45">{card.number}</div>
      <div className="absolute top-1 right-1 text-xs font-bold rotate-45">{card.number}</div>
      <div className="absolute bottom-1 left-1 text-xs font-bold rotate-45">{card.number}</div>
      <div className="absolute bottom-1 right-1 text-xs font-bold -rotate-45">{card.number}</div>
      
      {/* Bull head points at top */}
      <div className="absolute top-3 left-0 right-0 flex justify-center gap-0.5 px-2">
        {Array.from({ length: card.bullHeads }).map((_, i) => (
          <span key={i} data-testid="bull-head" className="text-xs">
            🐮
          </span>
        ))}
      </div>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Blurred cow background */}
        <div className="absolute text-6xl blur-sm opacity-30">
          🐮
        </div>
        {/* Card number with impact-style border */}
        <div 
          className="relative text-4xl font-black text-black z-10"
          style={{
            textShadow: `
              -2px -2px 0 #fff,
              2px -2px 0 #fff,
              -2px 2px 0 #fff,
              2px 2px 0 #fff,
              -3px 0px 0 #fff,
              3px 0px 0 #fff,
              0px -3px 0 #fff,
              0px 3px 0 #fff
            `
          }}
        >
          {card.number}
        </div>
      </div>
    </div>
  )
}