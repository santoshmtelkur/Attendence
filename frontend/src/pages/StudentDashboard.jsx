import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { ReportApi, AttendanceApi } from '../api/endpoints'
import { StatusBadge, PercentageBadge } from '../components/Badges'
import { EmptyState } from '../components/Shared'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.profileId) return
    Promise.all([
      ReportApi.studentSummary(user.profileId),
      AttendanceApi.studentHistory(user.profileId)
    ]).then(([s, h]) => {
      setSummary(s)
      setHistory(h)
    }).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="text-ink/40 text-sm">Loading your attendance…</div>
  if (!summary) return <EmptyState message="No attendance data available yet." />

  const isLow = summary.percentage < 75
  const chartData = summary.bySubject.map((s) => ({ name: s.subjectName, percentage: s.percentage }))

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-1">My Attendance</h1>
      <p className="text-sm text-ink/50 mb-8">{summary.rollNumber} · {summary.studentName}</p>

      {isLow && (
        <div className="mb-6 rounded-lg border border-bad/30 bg-bad/5 px-5 py-4 text-sm text-bad">
          Your overall attendance is <strong>{summary.percentage.toFixed(1)}%</strong>, below the required 75% minimum.
          Please speak with your class coordinator about a plan to catch up.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-xs text-ink/50 mb-1">Overall attendance</div>
          <div className="font-serif text-3xl font-semibold">{summary.percentage.toFixed(1)}%</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink/50 mb-1">Classes attended</div>
          <div className="font-serif text-3xl font-semibold">{summary.present}<span className="text-ink/30 text-lg"> / {summary.total}</span></div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink/50 mb-1">Subjects tracked</div>
          <div className="font-serif text-3xl font-semibold">{summary.bySubject.length}</div>
        </div>
      </div>

      <div className="card p-5 mb-8">
        <h2 className="text-sm font-semibold mb-4">Subject-wise attendance</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DCE1EA" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#16233F99' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#16233F99' }} />
            <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.percentage < 60 ? '#B3432B' : d.percentage < 75 ? '#C9A227' : '#2E7D53'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Date</th>
              <th>Period</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.recordId}>
                <td>{h.date}</td>
                <td>{h.period}</td>
                <td>{h.subjectName}</td>
                <td><StatusBadge status={h.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && <EmptyState message="No sessions recorded yet." />}
      </div>
    </div>
  )
}
