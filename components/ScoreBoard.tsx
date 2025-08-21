import React from 'react'
import { type Player } from '../engine/player'

export type ScoreBoardProps = {
  players: Player[]
  currentPlayerIndex?: number
  sortByScore?: boolean
  currentRound?: number
  className?: string
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  currentPlayerIndex,
  sortByScore = false,
  currentRound,
  className = ''
}) => {
  // Calculate scores for each player
  const playersWithScores = players.map(player => ({
    ...player,
    score: player.penaltyCards.reduce((sum, card) => sum + card.bullHeads, 0)
  }))

  // Sort if requested
  const displayPlayers = sortByScore 
    ? [...playersWithScores].sort((a, b) => a.score - b.score)
    : playersWithScores

  // Find the leader (lowest score)
  const minScore = Math.min(...playersWithScores.map(p => p.score))

  if (players.length === 0) {
    return (
      <div data-testid="scoreboard" className={`p-4 bg-white rounded-lg shadow ${className}`.trim()}>
        <div className="text-gray-500 text-center">No players</div>
      </div>
    )
  }

  return (
    <div data-testid="scoreboard" className={`p-4 bg-white rounded-lg shadow ${className}`.trim()}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Scoreboard</h2>
        {currentRound && (
          <span className="text-sm text-gray-600">Round {currentRound}</span>
        )}
      </div>

      {/* Players table */}
      <div className="space-y-2">
        {displayPlayers.map((player, displayIndex) => {
          const originalIndex = players.findIndex(p => p.index === player.index)
          const isCurrentPlayer = currentPlayerIndex === originalIndex
          const isLeader = player.score === minScore
          const nearLimit = player.score >= 60

          return (
            <div
              key={player.index}
              data-testid={`player-row-${originalIndex}`}
              className={`flex items-center justify-between p-3 rounded ${
                isCurrentPlayer ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{player.name}</span>
                {isLeader && (
                  <span 
                    data-testid="leader-badge"
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Leader
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {nearLimit && (
                  <span
                    data-testid={`warning-${originalIndex}`}
                    className="text-yellow-500"
                    title="Near 66 point limit!"
                  >
                    ⚠️
                  </span>
                )}
                <span
                  data-testid={`score-${originalIndex}`}
                  className={`font-bold text-lg ${
                    nearLimit ? 'text-red-600' : 'text-gray-800'
                  }`}
                >
                  {player.score}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}