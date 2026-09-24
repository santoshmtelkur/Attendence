package com.college.attendance.scheduler;

import com.college.attendance.dto.AttendanceDtos.LowAttendanceRow;
import com.college.attendance.dto.AttendanceDtos.StudentAttendanceSummary;
import com.college.attendance.service.EmailService;
import com.college.attendance.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowAttendanceScheduler {

    private final ReportService reportService;
    private final EmailService emailService;

    @Value("${app.attendance.low-threshold}")
    private double threshold;

    /**
     * Runs every Monday at 8 AM: emails every student currently below the configured threshold
     * a digest with their subject-wise breakdown, in addition to the immediate per-absence email.
     */
    @Scheduled(cron = "${app.attendance.digest-cron}")
    public void sendWeeklyDigest() {
        List<LowAttendanceRow> lowList = reportService.lowAttendance(threshold);
        log.info("Weekly low-attendance digest: {} students below {}%", lowList.size(), threshold);

        for (LowAttendanceRow row : lowList) {
            StudentAttendanceSummary summary = reportService.studentSummary(row.studentId());
            List<String> lines = summary.bySubject().stream()
                    .map(s -> String.format("%s: %.1f%% (%d/%d)", s.subjectName(), s.percentage(), s.present(), s.total()))
                    .toList();
            emailService.sendLowAttendanceDigest(row.email(), row.studentName(), row.percentage(), threshold, lines);
        }
    }
}
