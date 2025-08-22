import React from 'react'
import { type Card as CardType } from '../engine/card'

// Add animated gradient border styles
const animatedBorderStyles = `
  @keyframes gradientRotate {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .selected-card-border {
    position: relative;
  }
  
  .selected-card-border::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 12px;
    padding: 4px;
    background: linear-gradient(
      90deg,
      #3b82f6,
      #8b5cf6,
      #ec4899,
      #ef4444,
      #f59e0b,
      #10b981,
      #3b82f6
    );
    background-size: 200% 200%;
    animation: gradientRotate 3s linear infinite;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    z-index: -1;
  }
`

export type CardProps = {
  card: CardType
  onClick?: (card: CardType) => void
  selected?: boolean
  disabled?: boolean
  size?: 'normal' | 'small'
  className?: string
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  selected = false, 
  disabled = false,
  size = 'normal',
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

  const sizeClasses = size === 'small' ? 'w-20 h-28' : 'w-28 h-40'
  const baseClasses = `relative ${getBackgroundClass()} border-2 border-gray-800 rounded-lg shadow-md transition-all ${sizeClasses}`
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
  const selectedClasses = selected ? 'selected-card-border' : ''
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
    <>
      {selected && <style dangerouslySetInnerHTML={{ __html: animatedBorderStyles }} />}
      <div
        data-testid="card"
        className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} ${className}`.trim()}
        onClick={handleClick}
      >
      {/* Corner numbers */}
      <div className={`absolute top-1 left-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-bold -rotate-45`}>{card.number}</div>
      <div className={`absolute top-1 right-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-bold rotate-45`}>{card.number}</div>
      <div className={`absolute bottom-1 left-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-bold rotate-45`}>{card.number}</div>
      <div className={`absolute bottom-1 right-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-bold -rotate-45`}>{card.number}</div>
      
      {/* Bull head points at top - multiple rows if needed */}
      <div className={`absolute ${size === 'small' ? 'top-2' : 'top-3'} left-0 right-0 ${size === 'small' ? 'px-1' : 'px-2'}`}>
        {bullHeadRows.map((count, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
              <span key={`${rowIndex}-${i}`} data-testid="bull-head" className={size === 'small' ? 'text-[10px]' : 'text-xs'}>
                🐮
              </span>
            ))}
          </div>
        ))}
      </div>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Larger, more visible cow background */}
        <div className={`absolute ${size === 'small' ? 'text-5xl' : 'text-8xl'} opacity-30`}>
          🐮
        </div>
        {/* Card number with impact-style border and color based on bull heads */}
        <div 
          className={`relative ${size === 'small' ? 'text-2xl' : 'text-4xl'} font-black z-10 ${
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
    </>
  )
}