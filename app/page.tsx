'use client'

import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Board } from '../components/Board'
import { PlayerHand } from '../components/PlayerHand'
import { ScoreBoard } from '../components/ScoreBoard'
import { GameLog } from '../components/GameLog'
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
      // Auto-resolve after a short delay so player can see what happened
      const timer = setTimeout(() => {
        resolveCurrentRound()
      }, 1500)
      return () => clearTimeout(timer)
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
    <div className="h-screen bg-gradient-to-b from-green-800 to-green-900 overflow-hidden flex flex-col">
      {/* Compact Header */}
      <div className="flex justify-between items-center px-6 py-2 text-white">
        <h1 className="text-xl font-bold">6 nimmt!</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Round {currentRoundNumber}</span>
          <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
            {gamePhase === 'selecting' && 'Select a card'}
            {gamePhase === 'selectingRow' && 'Select a row to take'}
            {gamePhase === 'resolving' && 'Resolving...'}
          </span>
        </div>
      </div>

      {/* Main Game Area - Fixed height instead of flex-1 */}
      <div className="h-[60vh] flex gap-4 px-6">
        {/* Board Area - Center/Left */}
        <div className="flex-1 flex items-center justify-center">
          <Board board={game.board} className="w-full max-w-5xl" />
        </div>
        
        {/* Side Panel - Right */}
        <div className="w-80 flex flex-col gap-3 py-4">
          <ScoreBoard 
            players={game.players} 
            currentPlayerIndex={0}
            currentRound={currentRoundNumber}
            className="bg-white/10 backdrop-blur text-white"
          />
          <GameLog 
            entries={logEntries} 
            className="flex-1 bg-white/10 backdrop-blur text-white max-h-[50vh] overflow-y-auto"
          />
        </div>
      </div>

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

      {/* Player Hand Area - Bottom - Takes remaining space */}
      <div className="flex-1 px-6 pb-2 flex flex-col justify-center">
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