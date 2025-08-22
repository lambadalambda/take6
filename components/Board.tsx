import React, { useState, useEffect, useRef } from 'react'
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
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    70% {
      transform: scale(0.95);
    }
    85% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
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
  
  .board-row-container { perspective: 1000px; }
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
  const [newCards, setNewCards] = useState<Map<number, number>>(new Map())
  const [previousBoard, setPreviousBoard] = useState<BoardType | null>(null)
  const placementCounter = useRef(0)
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!previousBoard) {
      setPreviousBoard(board)
      return
    }

    // Find cards that are new (not present anywhere in the previous board)
    const newCardMap = new Map<number, number>()
    
    // First, collect all card numbers from the previous board
    const previousCardNumbers = new Set<number>()
    previousBoard.forEach(row => {
      row.forEach(card => {
        previousCardNumbers.add(card.number)
      })
    })
    
    // Now find cards in current board that weren't in previous board at all
    board.forEach(row => {
      row.forEach(card => {
        if (!previousCardNumbers.has(card.number)) {
          placementCounter.current += 1
          newCardMap.set(card.number, placementCounter.current)
        }
      })
    })

    if (newCardMap.size > 0) {
      // Clear any existing timer
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current)
      }

      setNewCards(prev => {
        // Merge with existing new cards to avoid overwriting
        const merged = new Map(prev)
        newCardMap.forEach((value, key) => {
          merged.set(key, value)
        })
        return merged
      })
      setPreviousBoard(board)

      // Set new timer to clear all new cards after animation
      clearTimerRef.current = setTimeout(() => {
        setNewCards(new Map())
        clearTimerRef.current = null
      }, 1500) // Slightly longer to ensure animation completes
    } else {
      setPreviousBoard(board)
    }
  }, [board])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current)
      }
    }
  }, [])

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
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-white/60 text-sm font-bold drop-shadow-[0_2px_6px_rgba(139,92,246,0.5)]">
              R{rowIndex + 1}
            </div>
            
            {/* Bull head count */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-white/80">
              <span 
                data-testid={`row-${rowIndex}-bullheads`}
                className={`font-bold text-lg ${bullHeadTotal > 10 ? 'text-red-400' : bullHeadTotal > 5 ? 'text-yellow-400' : 'text-white/60'} drop-shadow-[0_2px_6px_rgba(236,72,153,0.35)]`}
              >
                🐮 {bullHeadTotal}
              </span>
            </div>
            
            <div className="flex gap-2 board-row-container rounded-xl bg-white/5 backdrop-blur-md p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {/* Render existing cards */}
              {row.map((card, cardIndex) => {
                const placementId = newCards.get(card.number)
                const isNew = placementId !== undefined
                // Use a key that includes placement ID to force new element for animations
                const key = isNew ? `card-${card.number}-placed-${placementId}` : `card-${card.number}`
                return (
                  <div 
                    key={key} 
                    className={`${isNew ? 'board-card-growing' : 'board-card-animate'} relative drop-shadow-[0_0_12px_rgba(139,92,246,0.35)]`}
                    style={{ animationDelay: isNew ? '0s' : `${cardIndex * 0.15 + rowIndex * 0.1}s` }}
                  >
                    <Card card={card} size="small" />
                  </div>
                )
              })}
              
              {/* Render empty slots */}
              {Array.from({ 
                length: MAX_CARDS_PER_ROW - row.length 
              }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  data-testid="empty-slot"
                  className="rounded-xl w-18 h-24 flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_18px_rgba(34,211,238,0.15)]"
                >
                  <span className="text-white/30 text-xs">•</span>
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
