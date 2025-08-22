import React, { useEffect, useState } from 'react'
import { type Card as CardType } from '../engine/card'
import { Card } from './Card'
import { type PlayerSelection } from '../engine/game'
import { type Board } from '../engine/board'
import { getRowForCard } from '../engine/board'

export type CardRevealOverlayProps = {
  selections: PlayerSelection[]
  playerNames: string[]
  board: Board
  onComplete: () => void
  onCardAnimating?: (cardIndex: number) => void
}

// Add swaying animation styles matching player hand
const swayingStyles = `
  @keyframes overlaySway {
    0%, 100% {
      transform: translateY(0px) rotateX(0deg) rotateY(0deg);
    }
    25% {
      transform: translateY(-6px) rotateX(5deg) rotateY(-3deg);
    }
    50% {
      transform: translateY(0px) rotateX(-3deg) rotateY(3deg);
    }
    75% {
      transform: translateY(5px) rotateX(-5deg) rotateY(-3deg);
    }
  }
  
  .overlay-card-sway {
    animation: overlaySway 4s ease-in-out infinite;
    transform-style: preserve-3d;
  }
`

export const CardRevealOverlay: React.FC<CardRevealOverlayProps> = ({
  selections,
  playerNames,
  board,
  onComplete,
  onCardAnimating
}) => {
  const [phase, setPhase] = useState<'fadingIn' | 'showing' | 'fadingOut' | 'done'>('fadingIn')
  
  // Sort selections by card number
  const sortedSelections = [...selections].sort((a, b) => a.card.number - b.card.number)
  
  useEffect(() => {
    // Fade in animation
    const fadeInTimer = setTimeout(() => {
      setPhase('showing')
    }, 100)
    
    // Just show cards for 2 seconds, then fade out
    const showTimer = setTimeout(() => {
      setPhase('fadingOut')
    }, 2100)
    
    // Complete after fade out
    const completeTimer = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 2400)
    
    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(showTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])
  
  if (phase === 'done') return null
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: swayingStyles }} />
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          phase === 'fadingIn' ? 'opacity-0' : 
          phase === 'fadingOut' ? 'opacity-0' : 
          'opacity-100'
        }`}
        style={{ perspective: '1000px' }}
      >
        <div className="flex gap-6">
          {sortedSelections.map((selection, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center gap-2 overlay-card-sway"
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              <Card card={selection.card} />
              <div className="bg-white px-3 py-1 rounded-full text-sm font-bold">
                {playerNames[selection.playerIndex]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}