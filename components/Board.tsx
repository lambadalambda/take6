import React from 'react'
import { type Board as BoardType } from '../engine/board'
import { getRowForCard } from '../engine/board'
import { type PlayerSelection } from '../engine/game'
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
  
  @keyframes cardGrowIn {
    0% {
      transform: scale(0) rotate(180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(90deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
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
  
  .board-card-growing {
    animation: cardGrowIn 1s ease-out forwards;
    transform-style: preserve-3d;
  }
  
  .board-row-container {
    perspective: 1000px;
  }
`

export type BoardProps = {
  board: BoardType
  className?: string
  animatingCardIndex?: number
  animatingSelections?: PlayerSelection[]
}

export const Board: React.FC<BoardProps> = ({ 
  board, 
  className = '',
  animatingCardIndex = -1,
  animatingSelections = []
}) => {
  const MAX_CARDS_PER_ROW = 5

  const calculateRowBullHeads = (row: BoardType[number]): number => {
    return row.reduce((sum, card) => sum + card.bullHeads, 0)
  }
  
  // Get all cards that should be shown as animating in this row
  const getAnimatingCardsForRow = (rowIndex: number) => {
    if (animatingCardIndex < 0 || !animatingSelections.length) return []
    
    // Sort selections by card number to match overlay order
    const sortedSelections = [...animatingSelections].sort((a, b) => a.card.number - b.card.number)
    
    // Get all cards up to and including the current animating index that belong to this row
    const cardsForRow = []
    for (let i = 0; i <= animatingCardIndex && i < sortedSelections.length; i++) {
      const selection = sortedSelections[i]
      const targetRow = getRowForCard(board, selection.card)
      const actualRow = targetRow === -1 ? (selection.chosenRow || 0) : targetRow
      
      if (actualRow === rowIndex) {
        cardsForRow.push({
          card: selection.card,
          isCurrentlyAnimating: i === animatingCardIndex
        })
      }
    }
    
    return cardsForRow
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
              
              {/* Render animating cards for this row */}
              {getAnimatingCardsForRow(rowIndex).map((animatingCard, index) => (
                <div 
                  key={`animating-${rowIndex}-${index}`} 
                  className={animatingCard.isCurrentlyAnimating ? "board-card-growing relative" : "board-card-animate relative"}
                >
                  <Card card={animatingCard.card} size="small" />
                </div>
              ))}
              
              {/* Render empty slots */}
              {Array.from({ 
                length: MAX_CARDS_PER_ROW - row.length - getAnimatingCardsForRow(rowIndex).length 
              }).map((_, i) => (
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