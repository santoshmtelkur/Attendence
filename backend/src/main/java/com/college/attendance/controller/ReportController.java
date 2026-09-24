package com.college.attendance.controller;

import com.college.attendance.dto.AttendanceDtos.LowAttendanceRow;
import com.college.attendance.dto.AttendanceDtos.StudentAttendanceSummary;
import com.college.attendance.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/students/{studentId}/summary")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN')")
    public StudentAttendanceSummary studentSummary(@PathVariable Long studentId) {
        return reportService.studentSummary(studentId);
    }

    @GetMapping("/low-attendance")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<LowAttendanceRow> lowAttendance(@RequestParam(defaultValue = "75") double threshold) {
        return reportService.lowAttendance(threshold);
    }
}
