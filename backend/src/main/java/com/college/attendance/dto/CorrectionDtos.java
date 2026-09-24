package com.college.attendance.dto;

import com.college.attendance.entity.AttendanceStatus;
import com.college.attendance.entity.CorrectionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CorrectionDtos {

    public record CreateCorrectionRequest(
            @NotNull Long attendanceRecordId,
            @NotNull AttendanceStatus newStatus,
            @NotBlank String reason
    ) {}

    public record ReviewRequest(String comment) {}

    public record CorrectionView(
            Long id,
            Long attendanceRecordId,
            String studentName,
            String subjectName,
            AttendanceStatus oldStatus,
            AttendanceStatus newStatus,
            String reason,
            CorrectionStatus status,
            String requestedByUsername,
            String reviewedByUsername,
            String reviewComment,
            LocalDateTime createdAt
    ) {}
}
