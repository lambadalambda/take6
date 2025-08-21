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

export const CardRevealOverlay: React.FC<CardRevealOverlayProps> = ({
  selections,
  playerNames,
  board,
  onComplete,
  onCardAnimating
}) => {
  const [phase, setPhase] = useState<'fadingIn' | 'showing' | 'animating' | 'fadingOut' | 'done'>('fadingIn')
  const [currentCardIndex, setCurrentCardIndex] = useState(-1)
  const [animatingCards, setAnimatingCards] = useState<Set<number>>(new Set())
  
  // Sort selections by card number
  const sortedSelections = [...selections].sort((a, b) => a.card.number - b.card.number)
  
  useEffect(() => {
    // Fade in animation
    const fadeInTimer = setTimeout(() => {
      setPhase('showing')
    }, 100)
    
    // Start card animations after showing for 2 seconds
    const showTimer = setTimeout(() => {
      setPhase('animating')
      setCurrentCardIndex(0)
    }, 2100)
    
    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(showTimer)
    }
  }, [])
  
  useEffect(() => {
    if (phase === 'animating' && currentCardIndex >= 0) {
      // Add current card to animating set
      setAnimatingCards(prev => new Set(prev).add(currentCardIndex))
      
      // Notify parent about which card is animating (for board to show grow animation)
      if (onCardAnimating) {
        onCardAnimating(currentCardIndex)
      }
      
      if (currentCardIndex < sortedSelections.length - 1) {
        // Move to next card after 1 second
        const timer = setTimeout(() => {
          setCurrentCardIndex(currentCardIndex + 1)
        }, 1000)
        return () => clearTimeout(timer)
      } else {
        // All cards animated, start fade out after last animation
        const timer = setTimeout(() => {
          setPhase('fadingOut')
          
          // Complete after fade out
          setTimeout(() => {
            setPhase('done')
            onComplete()
          }, 300)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [phase, currentCardIndex, sortedSelections.length, onComplete, onCardAnimating])
  
  if (phase === 'done') return null
  
  const getCardScale = (index: number) => {
    if (phase === 'animating' && animatingCards.has(index)) {
      // Card is animating - shrink to 0
      return 'scale(0)'
    }
    return 'scale(1)'
  }
  
  return (
    <div 
      className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ${
        phase === 'fadingIn' ? 'opacity-0' : 
        phase === 'fadingOut' ? 'opacity-0' : 
        'opacity-100'
      }`}
    >
      <div className="flex gap-6">
        {sortedSelections.map((selection, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center gap-2"
            style={{
              transform: getCardScale(index),
              transition: 'transform 1s ease-in-out'
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
  )
}