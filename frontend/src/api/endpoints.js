import api from './axios'

export const AuthApi = {
  login: (username, password) => api.post('/api/auth/login', { username, password }).then(r => r.data)
}

export const MasterApi = {
  departments: () => api.get('/api/admin/departments').then(r => r.data),
  createDepartment: (body) => api.post('/api/admin/departments', body).then(r => r.data),

  sections: () => api.get('/api/admin/sections').then(r => r.data),
  createSection: (body) => api.post('/api/admin/sections', body).then(r => r.data),

  subjects: () => api.get('/api/admin/subjects').then(r => r.data),
  createSubject: (body) => api.post('/api/admin/subjects', body).then(r => r.data),

  faculty: () => api.get('/api/admin/faculty').then(r => r.data),
  createFaculty: (body) => api.post('/api/admin/faculty', body).then(r => r.data),

  students: (sectionId) => api.get('/api/admin/students', { params: sectionId ? { sectionId } : {} }).then(r => r.data),
  createStudent: (body) => api.post('/api/admin/students', body).then(r => r.data),

  assignments: (facultyId) => api.get('/api/admin/assignments', { params: facultyId ? { facultyId } : {} }).then(r => r.data),
  createAssignment: (body) => api.post('/api/admin/assignments', body).then(r => r.data)
}

export const AttendanceApi = {
  createSession: (body) => api.post('/api/attendance/sessions', body).then(r => r.data),
  getSession: (sessionId) => api.get(`/api/attendance/sessions/${sessionId}`).then(r => r.data),
  mark: (sessionId, entries) => api.post(`/api/attendance/sessions/${sessionId}/mark`, { entries }).then(r => r.data),
  facultySessions: (facultyId) => api.get(`/api/attendance/faculty/${facultyId}/sessions`).then(r => r.data),
  studentHistory: (studentId) => api.get(`/api/attendance/students/${studentId}/history`).then(r => r.data)
}

export const CorrectionApi = {
  create: (body) => api.post('/api/corrections', body).then(r => r.data),
  list: (status) => api.get('/api/corrections', { params: status ? { status } : {} }).then(r => r.data),
  approve: (id, comment) => api.put(`/api/corrections/${id}/approve`, { comment }).then(r => r.data),
  reject: (id, comment) => api.put(`/api/corrections/${id}/reject`, { comment }).then(r => r.data)
}

export const ReportApi = {
  studentSummary: (studentId) => api.get(`/api/reports/students/${studentId}/summary`).then(r => r.data),
  lowAttendance: (threshold = 75) => api.get('/api/reports/low-attendance', { params: { threshold } }).then(r => r.data)
}
