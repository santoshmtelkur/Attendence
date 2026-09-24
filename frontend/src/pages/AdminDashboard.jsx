import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MasterApi, ReportApi, CorrectionApi } from '../api/endpoints'
import { Tabs, EmptyState } from '../components/Shared'
import { PercentageBadge } from '../components/Badges'

const TABS = [
  { key: 'overview', label: 'Low Attendance' },
  { key: 'departments', label: 'Departments' },
  { key: 'sections', label: 'Sections' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'faculty', label: 'Faculty' },
  { key: 'students', label: 'Students' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'corrections', label: 'Corrections' }
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-1">Admin Dashboard</h1>
      <p className="text-sm text-ink/50 mb-6">Manage academic structure and monitor attendance across the college.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewTab />}
      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'sections' && <SectionsTab />}
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'faculty' && <FacultyTab />}
      {tab === 'students' && <StudentsTab />}
      {tab === 'assignments' && <AssignmentsTab />}
      {tab === 'corrections' && <CorrectionsTab />}
    </div>
  )
}

// ---------------- Overview / Low Attendance ----------------
function OverviewTab() {
  const [threshold, setThreshold] = useState(75)
  const [rows, setRows] = useState(null)

  useEffect(() => { load() }, [])

  function load() {
    ReportApi.lowAttendance(threshold).then(setRows)
  }

  const chartData = (rows || []).slice(0, 10).map((r) => ({ name: r.rollNumber, percentage: r.percentage }))

  return (
    <div>
      <div className="flex items-end gap-4 mb-6">
        <div>
          <label className="label">Threshold (%)</label>
          <input type="number" className="input w-28" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {rows === null ? (
        <div className="text-sm text-ink/40">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState message={`No students below ${threshold}% attendance. Everyone is on track.`} />
      ) : (
        <>
          <div className="card p-5 mb-6">
            <h2 className="text-sm font-semibold mb-4">Lowest attendance (top 10)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE1EA" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#16233F99' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#16233F99' }} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.percentage < 60 ? '#B3432B' : '#C9A227'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Present / Total</th>
                  <th>Attendance</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId}>
                    <td>{r.rollNumber}</td>
                    <td>{r.studentName}</td>
                    <td>{r.sectionName}</td>
                    <td>{r.present} / {r.total}</td>
                    <td><PercentageBadge value={r.percentage} /></td>
                    <td className="text-ink/50">{r.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------- Departments ----------------
function DepartmentsTab() {
  const [items, setItems] = useState(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])
  function load() { MasterApi.departments().then(setItems) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await MasterApi.createDepartment({ name, code })
      setName(''); setCode('')
      toast.success('Department added')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add department')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ListTable
          items={items}
          columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }]}
          emptyMessage="No departments yet."
        />
      </div>
      <form onSubmit={submit} className="card p-5 h-fit space-y-3">
        <h3 className="text-sm font-semibold mb-1">Add department</h3>
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Code</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Add department'}</button>
      </form>
    </div>
  )
}

// ---------------- Sections ----------------
function SectionsTab() {
  const [items, setItems] = useState(null)
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', semester: 1, academicYear: '2026-27', departmentId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load(); MasterApi.departments().then((d) => { setDepartments(d); if (d.length) setForm((f) => ({ ...f, departmentId: d[0].id })) }) }, [])
  function load() { MasterApi.sections().then(setItems) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await MasterApi.createSection({ ...form, semester: Number(form.semester), departmentId: Number(form.departmentId) })
      toast.success('Section added')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add section')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ListTable
          items={items?.map((s) => ({ ...s, department: s.department?.name, }))}
          columns={[{ key: 'name', label: 'Section' }, { key: 'semester', label: 'Semester' }, { key: 'academicYear', label: 'Year' }, { key: 'department', label: 'Department' }]}
          emptyMessage="No sections yet."
        />
      </div>
      <form onSubmit={submit} className="card p-5 h-fit space-y-3">
        <h3 className="text-sm font-semibold mb-1">Add section</h3>
        <div>
          <label className="label">Section name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="A" required />
        </div>
        <div>
          <label className="label">Semester</label>
          <input type="number" className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required />
        </div>
        <div>
          <label className="label">Academic year</label>
          <input className="input" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} required />
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Add section'}</button>
      </form>
    </div>
  )
}

// ---------------- Subjects ----------------
function SubjectsTab() {
  const [items, setItems] = useState(null)
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', code: '', departmentId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load(); MasterApi.departments().then((d) => { setDepartments(d); if (d.length) setForm((f) => ({ ...f, departmentId: d[0].id })) }) }, [])
  function load() { MasterApi.subjects().then(setItems) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await MasterApi.createSubject({ ...form, departmentId: Number(form.departmentId) })
      toast.success('Subject added')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add subject')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ListTable
          items={items?.map((s) => ({ ...s, department: s.department?.name }))}
          columns={[{ key: 'name', label: 'Subject' }, { key: 'code', label: 'Code' }, { key: 'department', label: 'Department' }]}
          emptyMessage="No subjects yet."
        />
      </div>
      <form onSubmit={submit} className="card p-5 h-fit space-y-3">
        <h3 className="text-sm font-semibold mb-1">Add subject</h3>
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Code</label>
          <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Add subject'}</button>
      </form>
    </div>
  )
}

// ---------------- Faculty ----------------
function FacultyTab() {
  const [items, setItems] = useState(null)
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', email: '', employeeCode: '', departmentId: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load(); MasterApi.departments().then((d) => { setDepartments(d); if (d.length) setForm((f) => ({ ...f, departmentId: d[0].id })) }) }, [])
  function load() { MasterApi.faculty().then(setItems) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await MasterApi.createFaculty({ ...form, departmentId: Number(form.departmentId) })
      toast.success('Faculty added. Default password is "password123" unless one was set.')
      setForm({ name: '', email: '', employeeCode: '', departmentId: form.departmentId, username: '', password: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add faculty')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ListTable
          items={items?.map((f) => ({ ...f, department: f.department?.name }))}
          columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'employeeCode', label: 'Employee code' }, { key: 'department', label: 'Department' }]}
          emptyMessage="No faculty yet."
        />
      </div>
      <form onSubmit={submit} className="card p-5 h-fit space-y-3">
        <h3 className="text-sm font-semibold mb-1">Add faculty</h3>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Employee code</label>
          <input className="input" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Login username (optional)</label>
          <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="defaults to email" />
        </div>
        <div>
          <label className="label">Password (optional)</label>
          <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="defaults to password123" />
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Add faculty'}</button>
      </form>
    </div>
  )
}

// ---------------- Students ----------------
function StudentsTab() {
  const [items, setItems] = useState(null)
  const [departments, setDepartments] = useState([])
  const [sections, setSections] = useState([])
  const [form, setForm] = useState({ rollNumber: '', name: '', email: '', parentEmail: '', phone: '', departmentId: '', sectionId: '', username: '', password: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    MasterApi.departments().then((d) => { setDepartments(d); if (d.length) setForm((f) => ({ ...f, departmentId: d[0].id })) })
    MasterApi.sections().then((s) => { setSections(s); if (s.length) setForm((f) => ({ ...f, sectionId: s[0].id })) })
  }, [])
  function load() { MasterApi.students().then(setItems) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await MasterApi.createStudent({ ...form, departmentId: Number(form.departmentId), sectionId: Number(form.sectionId) })
      toast.success('Student added. Login password has been set by admin.')
      setForm((f) => ({ ...f, rollNumber: '', name: '', email: '', parentEmail: '', phone: '', username: '', password: '' }))
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add student')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ListTable
          items={items?.map((s) => ({ ...s, section: s.section?.name, department: s.department?.code }))}
          columns={[{ key: 'rollNumber', label: 'Roll No.' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Dept' }, { key: 'section', label: 'Section' }, { key: 'email', label: 'Email' }]}
          emptyMessage="No students yet."
        />
      </div>
      <form onSubmit={submit} className="card p-5 h-fit space-y-3">
        <h3 className="text-sm font-semibold mb-1">Add student</h3>
        <div>
          <label className="label">Roll number</label>
          <input className="input" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Parent email (for absence alerts)</label>
          <input type="email" className="input" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name} (Sem {s.semester}, {s.department?.code})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Login username (optional)</label>
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Defaults to roll number"
          />
        </div>
        <div>
          <label className="label">Student password</label>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Set login password"
            minLength={6}
            required
          />
          <p className="text-[11px] text-ink/40 mt-1">The password is securely hashed before it is stored.</p>
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Add student'}</button>
      </form>
    </div>
  )
}

// ---------------- Assignments ----------------
function AssignmentsTab() {
  const [items, setItems] = useState(null)
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [faculty, setFaculty] = useState([])
  const [form, setForm] = useState({ sectionId: '', subjectId: '', facultyId: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    MasterApi.sections().then((s) => { setSections(s); if (s.length) setForm((f) => ({ ...f, sectionId: s[0].id })) })
    MasterApi.subjects().then((s) => { setSubjects(s); if (s.length) setForm((f) => ({ ...f, subjectId: s[0].id })) })
    MasterApi.faculty().then((f) => { setFaculty(f); if (f.length) setForm((fm) => ({ ...fm, facultyId: f[0].id })) })
  }, [])
  function load() { MasterApi.assignments().then(setItems) }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await MasterApi.createAssignment({
        sectionId: Number(form.sectionId), subjectId: Number(form.subjectId), facultyId: Number(form.facultyId)
      })
      toast.success('Assignment created')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create assignment')
    } finally { setSaving(false) }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ListTable
          items={items?.map((a) => ({
            id: a.id,
            section: `${a.section?.name} (Sem ${a.section?.semester}, ${a.section?.department?.code})`,
            subject: a.subject?.name,
            faculty: a.faculty?.name
          }))}
          columns={[{ key: 'section', label: 'Section' }, { key: 'subject', label: 'Subject' }, { key: 'faculty', label: 'Faculty' }]}
          emptyMessage="No assignments yet. Assign a faculty member to a subject and section below."
        />
      </div>
      <form onSubmit={submit} className="card p-5 h-fit space-y-3">
        <h3 className="text-sm font-semibold mb-1">Assign faculty to a class</h3>
        <div>
          <label className="label">Section</label>
          <select className="input" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name} (Sem {s.semester}, {s.department?.code})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subject</label>
          <select className="input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Faculty</label>
          <select className="input" value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
            {faculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Create assignment'}</button>
      </form>
    </div>
  )
}

// ---------------- Corrections ----------------
function CorrectionsTab() {
  const [items, setItems] = useState(null)

  useEffect(() => { load() }, [])
  function load() { CorrectionApi.list('PENDING').then(setItems) }

  async function act(id, approve) {
    try {
      if (approve) await CorrectionApi.approve(id)
      else await CorrectionApi.reject(id)
      toast.success(approve ? 'Correction approved' : 'Correction rejected')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  if (items === null) return <div className="text-sm text-ink/40">Loading…</div>
  if (items.length === 0) return <EmptyState message="No pending correction requests." />

  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Change</th>
            <th>Reason</th>
            <th>Requested by</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.studentName}</td>
              <td>{c.subjectName}</td>
              <td className="text-xs text-ink/60">{c.oldStatus} → {c.newStatus}</td>
              <td className="text-xs max-w-xs">{c.reason}</td>
              <td className="text-xs text-ink/50">{c.requestedByUsername}</td>
              <td className="whitespace-nowrap">
                <button className="btn-secondary btn-sm mr-2" onClick={() => act(c.id, true)}>Approve</button>
                <button className="btn-danger btn-sm" onClick={() => act(c.id, false)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------- Shared list table ----------------
function ListTable({ items, columns, emptyMessage }) {
  if (items === null || items === undefined) return <div className="text-sm text-ink/40">Loading…</div>
  if (items.length === 0) return <EmptyState message={emptyMessage} />
  return (
    <div className="card overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id ?? i}>
              {columns.map((c) => <td key={c.key}>{item[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
