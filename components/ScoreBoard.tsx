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
    <div data-testid="scoreboard" className={`p-4 rounded-lg ${className}`.trim()}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Scores</h2>
        {currentRound && (
          <span className="text-sm opacity-60">R{currentRound}</span>
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
              className={`flex items-center justify-between p-2 rounded ${
                isCurrentPlayer ? 'bg-white/20 border border-white/40' : 'bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{player.name}</span>
                {isLeader && (
                  <span 
                    data-testid="leader-badge"
                    className="text-xs"
                  >
                    👑
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {nearLimit && (
                  <span
                    data-testid={`warning-${originalIndex}`}
                    className="text-yellow-400"
                    title="Near 66 point limit!"
                  >
                    ⚠️
                  </span>
                )}
                <span
                  data-testid={`score-${originalIndex}`}
                  className={`font-bold ${
                    nearLimit ? 'text-red-400' : ''
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