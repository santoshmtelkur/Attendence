package com.college.attendance.service;

import com.college.attendance.dto.AttendanceDtos.*;
import com.college.attendance.entity.*;
import com.college.attendance.exception.BadRequestException;
import com.college.attendance.exception.ResourceNotFoundException;
import com.college.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final SectionSubjectFacultyRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final EmailService emailService;

    public AttendanceSession createOrGetSession(CreateSessionRequest req) {
        SectionSubjectFaculty assignment = assignmentRepository.findById(req.sectionSubjectFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Section-Subject-Faculty assignment not found"));

        return sessionRepository.findBySectionSubjectFacultyIdAndSessionDateAndPeriod(
                        req.sectionSubjectFacultyId(), req.sessionDate(), req.period())
                .orElseGet(() -> {
                    AttendanceSession session = new AttendanceSession(null, assignment, req.sessionDate(), req.period(), LocalDateTime.now(), false);
                    return sessionRepository.save(session);
                });
    }

    public SessionDetailView getSessionDetail(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        List<Student> roster = studentRepository.findBySectionId(session.getSectionSubjectFaculty().getSection().getId());
        List<AttendanceRecord> existing = recordRepository.findBySessionId(sessionId);

        List<StudentRecordView> rows = roster.stream().map(student -> {
            AttendanceRecord rec = existing.stream()
                    .filter(r -> r.getStudent().getId().equals(student.getId()))
                    .findFirst().orElse(null);
            AttendanceStatus status = rec != null ? rec.getStatus() : null;
            String remarks = rec != null ? rec.getRemarks() : null;
            Long recordId = rec != null ? rec.getId() : null;
            return new StudentRecordView(student.getId(), student.getRollNumber(), student.getName(), recordId, status, remarks);
        }).toList();

        return new SessionDetailView(
                session.getId(),
                session.getSectionSubjectFaculty().getSubject().getName(),
                session.getSectionSubjectFaculty().getSection().getName(),
                session.getSessionDate(),
                session.getPeriod(),
                session.isLocked(),
                rows
        );
    }

    public void bulkMark(Long sessionId, BulkMarkRequest request) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (session.isLocked()) {
            throw new BadRequestException("Session is locked. Submit a correction request to change it.");
        }

        for (MarkEntry entry : request.entries()) {
            Student student = studentRepository.findById(entry.studentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + entry.studentId()));

            AttendanceRecord record = recordRepository.findBySessionIdAndStudentId(sessionId, entry.studentId())
                    .orElse(new AttendanceRecord(null, session, student, null, null, LocalDateTime.now(), null));

            boolean wasAbsentBefore = record.getStatus() == AttendanceStatus.ABSENT;
            record.setStatus(entry.status());
            record.setRemarks(entry.remarks());
            record.setUpdatedAt(LocalDateTime.now());
            recordRepository.save(record);

            boolean isAbsentNow = entry.status() == AttendanceStatus.ABSENT;
            if (isAbsentNow && !wasAbsentBefore) {
                // Snapshot all values while the transaction owns the JPA session.
                // Do not pass the managed entity to @Async.
                emailService.sendAbsenceNotification(
                        student.getName(),
                        student.getEmail(),
                        student.getParentEmail(),
                        session.getSectionSubjectFaculty().getSubject().getName(),
                        session.getSessionDate().format(java.time.format.DateTimeFormatter.ofPattern("EEE, dd MMM yyyy")),
                        session.getPeriod()
                );
            }
        }

        // lock the session once submitted so further edits require a correction request
        session.setLocked(true);
        sessionRepository.save(session);
    }

    public List<HistoryEntry> getStudentHistory(Long studentId) {
        return recordRepository.findByStudentIdOrderBySessionSessionDateDesc(studentId).stream()
                .map(r -> new HistoryEntry(
                        r.getId(),
                        r.getSession().getId(),
                        r.getSession().getSessionDate(),
                        r.getSession().getPeriod(),
                        r.getSession().getSectionSubjectFaculty().getSubject().getName(),
                        r.getStatus()))
                .toList();
    }

    public List<AttendanceSession> getSessionsForFaculty(Long facultyId) {
        return sessionRepository.findBySectionSubjectFacultyFacultyId(facultyId);
    }
}
