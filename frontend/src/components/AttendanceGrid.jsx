import React, { useState } from 'react'
import { StatusBadge } from './Badges'

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']

const STATUS_STYLES = {
  PRESENT: 'bg-good text-white border-good',
  ABSENT: 'bg-bad text-white border-bad',
  LATE: 'bg-warn text-white border-warn',
  EXCUSED: 'bg-navy2 text-white border-navy2'
}

export default function AttendanceGrid({ session, onMark, onRequestCorrection, marking }) {
  const [draft, setDraft] = useState(() => {
    const init = {}
    session.records.forEach((r) => { init[r.studentId] = r.status || 'PRESENT' })
    return init
  })

  function setStatus(studentId, status) {
    setDraft((d) => ({ ...d, [studentId]: status }))
  }

  function markAllPresent() {
    const next = {}
    session.records.forEach((r) => { next[r.studentId] = 'PRESENT' })
    setDraft(next)
  }

  function handleSubmit() {
    const entries = session.records.map((r) => ({
      studentId: r.studentId,
      status: draft[r.studentId],
      remarks: null
    }))
    onMark(entries)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">{session.subjectName} · Section {session.sectionName}</div>
          <div className="text-xs text-ink/50">{session.sessionDate} · Period {session.period}</div>
        </div>
        {!session.locked && (
          <button onClick={markAllPresent} className="btn-secondary btn-sm">Mark all present</button>
        )}
      </div>

      {session.locked && (
        <div className="mb-4 rounded-md bg-amber/10 text-amber text-xs px-3 py-2">
          This session has already been submitted. To change a status now, use "Request fix" on the row —
          it will need admin approval.
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {session.records.map((r) => (
              <tr key={r.studentId}>
                <td className="text-ink/60">{r.rollNumber}</td>
                <td>{r.studentName}</td>
                <td>
                  {session.locked ? (
                    <StatusBadge status={r.status} />
                  ) : (
                    <div className="flex gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(r.studentId, s)}
                          className={`text-[11px] font-medium rounded px-2 py-1 border transition-colors ${
                            draft[r.studentId] === s ? STATUS_STYLES[s] : 'bg-white border-line text-ink/50 hover:border-ink/30'
                          }`}
                        >
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {session.locked && (
                    <button
                      onClick={() => onRequestCorrection(r)}
                      className="text-xs text-navy2 hover:underline"
                    >
                      Request fix
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!session.locked && (
        <div className="mt-5 flex justify-end">
          <button onClick={handleSubmit} disabled={marking} className="btn-primary">
            {marking ? 'Submitting…' : 'Submit attendance'}
          </button>
        </div>
      )}
    </div>
  )
}
