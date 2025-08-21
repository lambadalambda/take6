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

  // Color based on bull heads
  const getBackgroundClass = () => {
    if (card.bullHeads === 7) {
      // Menacing gradient for highest penalty
      return 'bg-gradient-to-br from-red-500 via-yellow-400 to-red-500'
    } else if (card.bullHeads === 5) {
      return 'bg-red-200'
    } else if (card.bullHeads === 3) {
      return 'bg-yellow-200'
    } else if (card.bullHeads === 2) {
      return 'bg-yellow-100'
    } else {
      return 'bg-white'
    }
  }

  const baseClasses = `relative ${getBackgroundClass()} border-2 border-gray-800 rounded-lg shadow-md transition-all w-28 h-40`
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
  const selectedClasses = selected ? 'ring-4 ring-blue-500' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  // Split bull heads into rows if more than 5
  const bullHeadRows: number[] = []
  if (card.bullHeads <= 5) {
    bullHeadRows.push(card.bullHeads)
  } else if (card.bullHeads === 7) {
    // Special case for 7: split 4+3
    bullHeadRows.push(4)
    bullHeadRows.push(3)
  } else {
    // For 6 or other cases: first row gets 5, rest on second row
    bullHeadRows.push(5)
    bullHeadRows.push(card.bullHeads - 5)
  }

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
      
      {/* Bull head points at top - multiple rows if needed */}
      <div className="absolute top-3 left-0 right-0 px-2">
        {bullHeadRows.map((count, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
              <span key={`${rowIndex}-${i}`} data-testid="bull-head" className="text-xs">
                🐮
              </span>
            ))}
          </div>
        ))}
      </div>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Larger, more visible cow background */}
        <div className="absolute text-8xl opacity-30">
          🐮
        </div>
        {/* Card number with impact-style border and color based on bull heads */}
        <div 
          className={`relative text-4xl font-black z-10 ${
            card.bullHeads === 7 ? 'text-red-600' :
            card.bullHeads === 5 ? 'text-red-500' :
            card.bullHeads === 3 ? 'text-yellow-600' :
            card.bullHeads === 2 ? 'text-yellow-500' :
            'text-gray-800'
          }`}
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