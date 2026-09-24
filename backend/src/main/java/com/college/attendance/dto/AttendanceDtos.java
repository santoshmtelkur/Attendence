package com.college.attendance.dto;

import com.college.attendance.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class AttendanceDtos {

    public record CreateSessionRequest(
            @NotNull Long sectionSubjectFacultyId,
            @NotNull LocalDate sessionDate,
            @NotNull Integer period
    ) {}

    public record MarkEntry(@NotNull Long studentId, @NotNull AttendanceStatus status, String remarks) {}

    public record BulkMarkRequest(@NotNull List<MarkEntry> entries) {}

    public record StudentRecordView(
            Long studentId,
            String rollNumber,
            String studentName,
            Long recordId,
            AttendanceStatus status,
            String remarks
    ) {}

    public record SessionDetailView(
            Long sessionId,
            String subjectName,
            String sectionName,
            LocalDate sessionDate,
            Integer period,
            boolean locked,
            List<StudentRecordView> records
    ) {}

    public record HistoryEntry(
            Long recordId,
            Long sessionId,
            LocalDate date,
            Integer period,
            String subjectName,
            AttendanceStatus status
    ) {}

    public record SubjectSummary(Long subjectId, String subjectName, long present, long total, double percentage) {}

    public record StudentAttendanceSummary(
            Long studentId,
            String rollNumber,
            String studentName,
            long present,
            long total,
            double percentage,
            List<SubjectSummary> bySubject
    ) {}

    public record LowAttendanceRow(
            Long studentId,
            String rollNumber,
            String studentName,
            String email,
            String sectionName,
            long present,
            long total,
            double percentage
    ) {}
}
