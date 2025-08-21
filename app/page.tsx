'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Board } from '../components/Board'
import { PlayerHand } from '../components/PlayerHand'
import { ScoreBoard } from '../components/ScoreBoard'
import { GameLog } from '../components/GameLog'
import { CardRevealOverlay } from '../components/CardRevealOverlay'
import { type Card } from '../engine/card'

export default function GamePage() {
  const {
    game,
    selectedCard,
    gamePhase,
    rowSelection,
    logEntries,
    initializeGame,
    startNewRound,
    selectCard,
    submitTurn,
    selectRow,
    resolveCurrentRound,
    isGameOver,
    getWinner,
    resetGame
  } = useGameStore()

  const [showRowSelection, setShowRowSelection] = useState(false)
  const [animatingCardIndex, setAnimatingCardIndex] = useState<number>(-1)

  // Initialize game on mount
  useEffect(() => {
    if (!game) {
      initializeGame(['You', 'Bot Alice', 'Bot Bob', 'Bot Charlie'])
      startNewRound()
    }
  }, [game, initializeGame, startNewRound])

  // Handle game phase changes
  useEffect(() => {
    if (gamePhase === 'selectingRow') {
      setShowRowSelection(true)
    } else {
      setShowRowSelection(false)
    }

    if (gamePhase === 'resolving') {
      // Immediately resolve since we already showed the animation
      resolveCurrentRound()
    }
  }, [gamePhase, resolveCurrentRound])

  const handleCardSelect = (card: Card) => {
    if (gamePhase === 'selecting') {
      selectCard(card)
    }
  }

  const handleSubmitTurn = () => {
    if (selectedCard && gamePhase === 'selecting') {
      submitTurn()
    }
  }

  const handleRowSelect = (rowIndex: number) => {
    if (gamePhase === 'selectingRow') {
      selectRow(rowIndex)
      setShowRowSelection(false)
    }
  }

  const handleNewGame = () => {
    resetGame()
    initializeGame(['You', 'Bot Alice', 'Bot Bob', 'Bot Charlie'])
    startNewRound()
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    )
  }

  const humanPlayer = game.players[0]
  const currentRoundNumber = game.currentRound

  // Check for game over
  if (isGameOver()) {
    const winner = getWinner()
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">Game Over!</h1>
          <p className="text-2xl">
            Winner: <span className="font-bold text-green-600">{winner?.name}</span> with {winner?.score} points
          </p>
          <ScoreBoard players={game.players} sortByScore={true} />
          <button
            onClick={handleNewGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    )
  }

  // Check for round complete
  if (humanPlayer.hand.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Round {currentRoundNumber} Complete!</h1>
          <ScoreBoard players={game.players} sortByScore={true} />
          <button
            onClick={startNewRound}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Next Round
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-green-800 to-green-900 overflow-hidden flex flex-col relative">
      {/* Lava lamp background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes lavaFloat1 {
            0%, 100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(30px, -30px) scale(1.1) rotate(120deg);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9) rotate(240deg);
            }
          }
          
          @keyframes lavaFloat2 {
            0%, 100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(-40px, 40px) scale(1.2) rotate(-120deg);
            }
            66% {
              transform: translate(40px, -20px) scale(0.8) rotate(-240deg);
            }
          }
          
          @keyframes lavaFloat3 {
            0%, 100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(20px, 50px) scale(0.9) rotate(180deg);
            }
            66% {
              transform: translate(-30px, -40px) scale(1.1) rotate(360deg);
            }
          }
          
          .lava-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(40px);
            opacity: 0.7;
            mix-blend-mode: multiply;
          }
          
          .lava-blob-1 {
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.6) 50%, transparent 70%);
            top: -200px;
            left: -200px;
            animation: lavaFloat1 20s ease-in-out infinite;
          }
          
          .lava-blob-2 {
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(21, 128, 61, 0.8) 0%, rgba(20, 83, 45, 0.6) 50%, transparent 70%);
            top: 50%;
            right: -300px;
            animation: lavaFloat2 25s ease-in-out infinite;
          }
          
          .lava-blob-3 {
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(74, 222, 128, 0.6) 0%, rgba(34, 197, 94, 0.4) 50%, transparent 70%);
            bottom: -300px;
            left: 30%;
            animation: lavaFloat3 30s ease-in-out infinite;
          }
          
          .lava-blob-4 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(20, 83, 45, 0.8) 0%, rgba(5, 46, 22, 0.6) 50%, transparent 70%);
            top: 20%;
            left: 40%;
            animation: lavaFloat2 22s ease-in-out infinite reverse;
          }
          
          .lava-blob-5 {
            width: 650px;
            height: 650px;
            background: radial-gradient(circle, rgba(34, 197, 94, 0.7) 0%, rgba(74, 222, 128, 0.5) 50%, transparent 70%);
            bottom: 10%;
            right: 10%;
            animation: lavaFloat1 28s ease-in-out infinite;
          }
        ` }} />
        <div className="lava-blob lava-blob-1"></div>
        <div className="lava-blob lava-blob-2"></div>
        <div className="lava-blob lava-blob-3"></div>
        <div className="lava-blob lava-blob-4"></div>
        <div className="lava-blob lava-blob-5"></div>
      </div>
      
      {/* Compact Header */}
      <div className="h-12 flex justify-between items-center px-6 text-white relative z-10">
        <h1 className="text-xl font-bold">6 nimmt!</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Round {currentRoundNumber}</span>
          <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
            {gamePhase === 'selecting' && 'Select a card'}
            {gamePhase === 'selectingRow' && 'Select a row to take'}
            {gamePhase === 'revealing' && 'Revealing cards...'}
            {gamePhase === 'resolving' && 'Resolving...'}
          </span>
        </div>
      </div>

      {/* Main Game Area - Takes available space between header and player hand */}
      <div className="flex-1 flex gap-4 px-6 py-2 relative z-10">
        {/* Board Area - Center/Left */}
        <div className="flex-1 flex items-center justify-center">
          <Board 
            board={game.board} 
            className="w-full max-w-5xl"
            animatingCardIndex={gamePhase === 'revealing' ? animatingCardIndex : -1}
            animatingSelections={gamePhase === 'revealing' ? game.playerSelections : []}
          />
        </div>
        
        {/* Side Panel - Right */}
        <div className="w-80 flex flex-col gap-3">
          <ScoreBoard 
            players={game.players} 
            currentPlayerIndex={0}
            currentRound={currentRoundNumber}
            className="bg-white/10 backdrop-blur text-white"
          />
          <GameLog 
            entries={logEntries} 
            className="flex-1 bg-white/10 backdrop-blur text-white overflow-y-auto"
          />
        </div>
      </div>

        {/* Card Reveal Overlay */}
        {gamePhase === 'revealing' && game && game.playerSelections.length > 0 && (
          <CardRevealOverlay
            selections={game.playerSelections}
            playerNames={game.players.map(p => p.name)}
            board={game.board}
            onCardAnimating={(index) => {
              setAnimatingCardIndex(index)
            }}
            onComplete={() => {
              setAnimatingCardIndex(-1)
              useGameStore.setState({ gamePhase: 'resolving' })
            }}
          />
        )}

        {/* Row Selection Modal */}
        {showRowSelection && rowSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-bold mb-4">
                Card {rowSelection.card.number} is too low!
              </h2>
              <p className="mb-4">Choose a row to take all its cards:</p>
              <div className="space-y-2">
                {game.board.map((row, index) => (
                  <button
                    key={index}
                    onClick={() => handleRowSelect(index)}
                    className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    Row {index + 1}: {row.map(c => c.number).join(', ')} 
                    ({row.reduce((sum, c) => sum + c.bullHeads, 0)} bull heads)
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Player Hand Area - Bottom - Fixed height */}
      <div className="h-56 px-6 pb-2 relative z-10">
        <PlayerHand
          cards={humanPlayer.hand}
          selectedCard={selectedCard}
          onCardSelect={handleCardSelect}
          playerName="You"
          disabled={gamePhase !== 'selecting'}
          className="bg-transparent"
        />
        
        {/* Submit button */}
        {gamePhase === 'selecting' && (
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleSubmitTurn}
              disabled={!selectedCard}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedCard
                  ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-lg'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedCard ? `Play Card ${selectedCard.number}` : 'Select a Card'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}