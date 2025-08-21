import React from 'react'

export type LogEntry = {
  player: string
  card: number
  action: 'placed' | 'took-row' | 'sixth-card'
  row: number
  penaltyCards?: number
  bullHeads?: number
}

export type GameLogProps = {
  entries: LogEntry[]
  className?: string
}

export const GameLog: React.FC<GameLogProps> = ({ entries, className = '' }) => {
  if (entries.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`.trim()}>
        <h3 className="text-lg font-semibold mb-2">Game Log</h3>
        <p className="text-gray-500 text-sm">No actions yet this turn</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`.trim()}>
      <h3 className="text-lg font-semibold mb-3">Last Turn Results</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries.map((entry, index) => (
          <div 
            key={index} 
            className={`text-sm p-2 rounded ${
              entry.action === 'took-row' || entry.action === 'sixth-card'
                ? 'bg-red-50 border-l-4 border-red-400'
                : 'bg-gray-50'
            }`}
          >
            <span className="font-medium">{entry.player}</span>
            {' played '}
            <span className="font-bold text-blue-600">{entry.card}</span>
            {entry.action === 'placed' && (
              <span> to row {entry.row}</span>
            )}
            {entry.action === 'took-row' && (
              <span className="text-red-600">
                {` → too low, took row ${entry.row} (${entry.penaltyCards} cards, ${entry.bullHeads} bull heads)`}
              </span>
            )}
            {entry.action === 'sixth-card' && (
              <span className="text-red-600">
                {` → 6th card, took row ${entry.row} (${entry.penaltyCards} cards, ${entry.bullHeads} bull heads)`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}