package com.college.attendance.controller;

import com.college.attendance.dto.AttendanceDtos.*;
import com.college.attendance.entity.AttendanceSession;
import com.college.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public AttendanceSession createSession(@Valid @RequestBody CreateSessionRequest req) {
        return attendanceService.createOrGetSession(req);
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public SessionDetailView getSession(@PathVariable Long sessionId) {
        return attendanceService.getSessionDetail(sessionId);
    }

    @PostMapping("/sessions/{sessionId}/mark")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public void mark(@PathVariable Long sessionId, @Valid @RequestBody BulkMarkRequest request) {
        attendanceService.bulkMark(sessionId, request);
    }

    @GetMapping("/faculty/{facultyId}/sessions")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public List<AttendanceSession> facultySessions(@PathVariable Long facultyId) {
        return attendanceService.getSessionsForFaculty(facultyId);
    }

    @GetMapping("/students/{studentId}/history")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN')")
    public List<HistoryEntry> studentHistory(@PathVariable Long studentId) {
        return attendanceService.getStudentHistory(studentId);
    }
}
