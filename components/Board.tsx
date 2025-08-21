import React from 'react'
import { type Board as BoardType } from '../engine/board'
import { Card } from './Card'

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
            
            <div className="flex gap-2">
              {/* Render existing cards */}
              {row.map((card, cardIndex) => (
                <Card key={`${rowIndex}-${cardIndex}`} card={card} size="small" />
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
  )
}