import React from 'react'
import { type Card as CardType } from '../engine/card'

// Visual styles: foil sheen, inner shadow, and a simple selected glow (no animated border)
const visualStyles = `
  /* Holographic foil sheen */
  .card-foil {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }
  .card-foil::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: conic-gradient(
      from 180deg at 50% 50%,
      rgba(236, 72, 153, 0.16),
      rgba(34, 211, 238, 0.12),
      rgba(139, 92, 246, 0.14),
      rgba(34, 197, 94, 0.12),
      rgba(236, 72, 153, 0.16)
    );
    mix-blend-mode: overlay;
    filter: blur(10px) saturate(115%);
    animation: foilSweep 8s linear infinite;
    pointer-events: none;
    z-index: 1;
  }
  @keyframes foilSweep {
    0% { transform: translateX(-12%) rotate(0deg) scale(1.03); opacity: 0.65; }
    50% { transform: translateX(12%) rotate(180deg) scale(1.00); opacity: 0.45; }
    100% { transform: translateX(-12%) rotate(360deg) scale(1.03); opacity: 0.65; }
  }

  /* Subtle inner shadow for depth */
  .card-inner-shadow { box-shadow: inset 0 2px 6px rgba(0,0,0,0.15), inset 0 -6px 12px rgba(0,0,0,0.12); }

  /* Selected state: static glow ring (no animation) */
  .selected-card-border { box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.8), 0 0 18px rgba(139, 92, 246, 0.35); }
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
  const baseClasses = `relative ${getBackgroundClass()} border-2 border-gray-800/90 rounded-xl shadow-md transition-all ${sizeClasses} card-foil card-inner-shadow`
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:shadow-xl hover:scale-105' : ''
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
      <style dangerouslySetInnerHTML={{ __html: visualStyles }} />
      <div
        data-testid="card"
        className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${disabledClasses} ${className}`.trim()}
        onClick={handleClick}
      >
      {/* Corner numbers */}
      <div className={`absolute top-1 left-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-extrabold -rotate-45 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]`}>{card.number}</div>
      <div className={`absolute top-1 right-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-extrabold rotate-45 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]`}>{card.number}</div>
      <div className={`absolute bottom-1 left-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-extrabold rotate-45 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]`}>{card.number}</div>
      <div className={`absolute bottom-1 right-1 ${size === 'small' ? 'text-[8px]' : 'text-xs'} font-extrabold -rotate-45 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]`}>{card.number}</div>
      
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
        <div className={`absolute ${size === 'small' ? 'text-5xl' : 'text-8xl'} opacity-30`}
          style={{ filter: 'drop-shadow(0 4px 8px rgba(236,72,153,0.35))' }}
        >
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
              0px 3px 0 #fff,
              0 0 10px rgba(139,92,246,0.35)
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
