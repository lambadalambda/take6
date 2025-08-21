import React from 'react'
import { type Board as BoardType } from '../engine/board'
import { Card } from './Card'

// Add breathing animation styles with 3D tilt - more exaggerated for small cards
const breathingStyles = `
  @keyframes boardBreathe {
    0%, 100% {
      transform: translateY(0px) rotateX(0deg) rotateY(0deg) scale(1);
    }
    25% {
      transform: translateY(-4px) rotateX(3deg) rotateY(-2deg) scale(1.05);
    }
    50% {
      transform: translateY(0px) rotateX(-2deg) rotateY(2deg) scale(1.02);
    }
    75% {
      transform: translateY(3px) rotateX(-3deg) rotateY(-2deg) scale(1.03);
    }
  }
  
  .board-card-animate {
    animation: boardBreathe 3s ease-in-out infinite;
    transform-style: preserve-3d;
    transition: all 0.2s ease;
  }
  
  .board-card-animate:hover {
    transform: translateY(-6px) scale(1.1) !important;
    z-index: 10;
  }
  
  .board-row-container {
    perspective: 1000px;
  }
`

export type BoardProps = {
  board: BoardType
  className?: string
}

export const Board: React.FC<BoardProps> = ({ board, className = '' }) => {
  const MAX_CARDS_PER_ROW = 5

  const calculateRowBullHeads = (row: BoardType[number]): number => {
    return row.reduce((sum, card) => sum + card.bullHeads, 0)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: breathingStyles }} />
      <div data-testid="board" className={`space-y-2 px-12 ${className}`.trim()}>
      {board.map((row, rowIndex) => {
        const isFull = row.length === MAX_CARDS_PER_ROW
        const bullHeadTotal = calculateRowBullHeads(row)
        
        return (
          <div
            key={rowIndex}
            data-testid={`row-${rowIndex}`}
            className={`relative ${isFull ? 'animate-pulse' : ''}`}
          >
            {/* Row indicator */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-white/60 text-sm font-bold">
              R{rowIndex + 1}
            </div>
            
            {/* Bull head count */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-white/80">
              <span 
                data-testid={`row-${rowIndex}-bullheads`}
                className={`font-bold text-lg ${bullHeadTotal > 10 ? 'text-red-400' : bullHeadTotal > 5 ? 'text-yellow-400' : 'text-white/60'}`}
              >
                🐮 {bullHeadTotal}
              </span>
            </div>
            
            <div className="flex gap-2 board-row-container">
              {/* Render existing cards */}
              {row.map((card, cardIndex) => (
                <div 
                  key={`${rowIndex}-${cardIndex}`} 
                  className="board-card-animate relative"
                  style={{ animationDelay: `${cardIndex * 0.15 + rowIndex * 0.1}s` }}
                >
                  <Card card={card} size="small" />
                </div>
              ))}
              
              {/* Render empty slots */}
              {Array.from({ length: MAX_CARDS_PER_ROW - row.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  data-testid="empty-slot"
                  className="border-2 border-dashed border-white/20 rounded-lg w-20 h-28 flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="text-white/20 text-xs">•</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
    </>
  )
}