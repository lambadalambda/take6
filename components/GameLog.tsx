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
      <div className={`rounded-lg p-4 ${className}`.trim()}>
        <h3 className="text-lg font-semibold mb-2">Log</h3>
        <p className="opacity-60 text-sm">No actions yet</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-4 ${className}`.trim()}>
      <h3 className="text-lg font-semibold mb-3">Last Turn</h3>
      <div className="space-y-1 overflow-y-auto">
        {entries.map((entry, index) => (
          <div 
            key={index} 
            className={`text-xs p-2 rounded ${
              entry.action === 'took-row' || entry.action === 'sixth-card'
                ? 'bg-red-500/20 border-l-2 border-red-400'
                : 'bg-white/10'
            }`}
          >
            <span className="font-medium">{entry.player}</span>
            {': '}
            <span className="font-bold">{entry.card}</span>
            {entry.action === 'placed' && (
              <span className="opacity-80"> → R{entry.row}</span>
            )}
            {entry.action === 'took-row' && (
              <span className="text-red-300">
                {` ✗ took R${entry.row} (${entry.bullHeads}🐮)`}
              </span>
            )}
            {entry.action === 'sixth-card' && (
              <span className="text-red-300">
                {` ✗ 6th card R${entry.row} (${entry.bullHeads}🐮)`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}