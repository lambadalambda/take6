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
    <div data-testid="board" className={`space-y-4 ${className}`.trim()}>
      {board.map((row, rowIndex) => {
        const isFull = row.length === MAX_CARDS_PER_ROW
        const bullHeadTotal = calculateRowBullHeads(row)
        
        return (
          <div
            key={rowIndex}
            data-testid={`row-${rowIndex}`}
            className={`p-4 rounded-lg border-2 ${
              isFull ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Row {rowIndex + 1}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Bull Heads:</span>
                <span 
                  data-testid={`row-${rowIndex}-bullheads`}
                  className="font-bold text-red-600"
                >
                  {bullHeadTotal}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* Render existing cards */}
              {row.map((card, cardIndex) => (
                <Card key={`${rowIndex}-${cardIndex}`} card={card} />
              ))}
              
              {/* Render empty slots */}
              {Array.from({ length: MAX_CARDS_PER_ROW - row.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  data-testid="empty-slot"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-24 h-32 flex items-center justify-center"
                >
                  <span className="text-gray-400">Empty</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}