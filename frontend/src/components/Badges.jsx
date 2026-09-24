import React from 'react'

export function StatusBadge({ status }) {
  if (!status) return <span className="text-ink/30 text-xs">Not marked</span>
  const map = {
    PRESENT: 'bg-good/10 text-good',
    ABSENT: 'bg-bad/10 text-bad',
    LATE: 'bg-warn/10 text-warn',
    EXCUSED: 'bg-navy2/10 text-navy2'
  }
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${map[status] || 'bg-ink/10'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export function PercentageBadge({ value }) {
  let cls = 'bg-good/10 text-good'
  if (value < 60) cls = 'bg-bad/10 text-bad'
  else if (value < 75) cls = 'bg-warn/10 text-warn'
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {value.toFixed(1)}%
    </span>
  )
}
