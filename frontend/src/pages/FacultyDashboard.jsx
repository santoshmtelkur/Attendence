import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { MasterApi, AttendanceApi, CorrectionApi } from '../api/endpoints'
import { Tabs, Modal, EmptyState } from '../components/Shared'
import { StatusBadge } from '../components/Badges'
import AttendanceGrid from '../components/AttendanceGrid'

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']

export default function FacultyDashboard() {
  const [tab, setTab] = useState('mark')
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-1">Faculty Dashboard</h1>
      <p className="text-sm text-ink/50 mb-6">Take attendance and manage correction requests.</p>
      <Tabs
        tabs={[{ key: 'mark', label: 'Mark Attendance' }, { key: 'corrections', label: 'My Correction Requests' }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'mark' ? <MarkAttendanceTab /> : <MyCorrectionsTab />}
    </div>
  )
}

function MarkAttendanceTab() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [assignmentId, setAssignmentId] = useState('')
  const [date, setDate] = useState(() => {
    const now = new Date()
    const offsetMs = now.getTimezoneOffset() * 60 * 1000
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10)
  })
  const [period, setPeriod] = useState(1)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)
  const [fixRow, setFixRow] = useState(null)

  useEffect(() => {
    if (!user?.profileId) return
    MasterApi.assignments(user.profileId).then((list) => {
      setAssignments(list)
      if (list.length) setAssignmentId(String(list[0].id))
    })
  }, [user])

  async function loadRoster() {
    if (!assignmentId) return
    setLoading(true)
    try {
      const created = await AttendanceApi.createSession({
        sectionSubjectFacultyId: Number(assignmentId),
        sessionDate: date,
        period: Number(period)
      })
      const detail = await AttendanceApi.getSession(created.id)
      setSession(detail)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load roster')
    } finally {
      setLoading(false)
    }
  }

  async function submitAttendance(entries) {
    setMarking(true)
    try {
      await AttendanceApi.mark(session.sessionId, entries)
      toast.success('Attendance submitted. Absentees have been emailed.')
      const refreshed = await AttendanceApi.getSession(session.sessionId)
      setSession(refreshed)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit attendance')
    } finally {
      setMarking(false)
    }
  }

  async function submitCorrection(reason, newStatus) {
    try {
      await CorrectionApi.create({ attendanceRecordId: fixRow.recordId, newStatus, reason })
      toast.success('Correction request sent for admin approval')
      setFixRow(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit correction request')
    }
  }

  return (
    <div>
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="label">Class · Subject</label>
            <select className="input" value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.section.name} ({a.section.department.code}, Sem {a.section.semester}) — {a.subject.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Period</label>
            <input type="number" min="1" max="8" className="input" value={period} onChange={(e) => setPeriod(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={loadRoster} disabled={loading || !assignmentId} className="btn-primary">
            {loading ? 'Loading…' : 'Load roster'}
          </button>
        </div>
      </div>

      {session && (
        <AttendanceGrid
          session={session}
          marking={marking}
          onMark={submitAttendance}
          onRequestCorrection={setFixRow}
        />
      )}

      {fixRow && (
        <FixModal row={fixRow} onClose={() => setFixRow(null)} onSubmit={submitCorrection} />
      )}
    </div>
  )
}

function FixModal({ row, onClose, onSubmit }) {
  const [newStatus, setNewStatus] = useState(row.status === 'ABSENT' ? 'PRESENT' : 'ABSENT')
  const [reason, setReason] = useState('')

  return (
    <Modal title={`Request fix — ${row.studentName}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <div className="text-xs text-ink/50 mb-1">Current status</div>
          <StatusBadge status={row.status} />
        </div>
        <div>
          <label className="label">Correct status should be</label>
          <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {STATUSES.filter((s) => s !== row.status).map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Reason for correction</label>
          <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Student was present, missed during roll call" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!reason.trim()}
            onClick={() => onSubmit(reason.trim(), newStatus)}
          >
            Send request
          </button>
        </div>
      </div>
    </Modal>
  )
}

function MyCorrectionsTab() {
  const { user } = useAuth()
  const [list, setList] = useState(null)

  useEffect(() => {
    CorrectionApi.list().then((all) => {
      setList(all.filter((c) => c.requestedByUsername === user.username))
    })
  }, [user])

  if (list === null) return <div className="text-sm text-ink/40">Loading…</div>
  if (list.length === 0) return <EmptyState message="You haven't requested any corrections." />

  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Change</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.studentName}</td>
              <td>{c.subjectName}</td>
              <td className="text-xs text-ink/60">{c.oldStatus} → {c.newStatus}</td>
              <td className="text-xs max-w-xs">{c.reason}</td>
              <td>
                <span className={`text-xs font-medium ${
                  c.status === 'PENDING' ? 'text-warn' : c.status === 'APPROVED' ? 'text-good' : 'text-bad'
                }`}>
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
