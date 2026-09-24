package com.college.attendance.service;

import com.college.attendance.dto.CorrectionDtos.*;
import com.college.attendance.entity.*;
import com.college.attendance.exception.BadRequestException;
import com.college.attendance.exception.ResourceNotFoundException;
import com.college.attendance.repository.AttendanceRecordRepository;
import com.college.attendance.repository.CorrectionRequestRepository;
import com.college.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CorrectionService {

    private final CorrectionRequestRepository correctionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public CorrectionRequest create(String requestedByUsername, CreateCorrectionRequest req) {
        AttendanceRecord record = recordRepository.findById(req.attendanceRecordId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        User requester = userRepository.findByUsername(requestedByUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (record.getStatus() == req.newStatus()) {
            throw new BadRequestException("New status is the same as the current status");
        }

        CorrectionRequest correction = new CorrectionRequest(
                null, record, record.getStatus(), req.newStatus(), req.reason(),
                CorrectionStatus.PENDING, requester, null, null, LocalDateTime.now(), null
        );
        return correctionRepository.save(correction);
    }

    public List<CorrectionView> listByStatus(CorrectionStatus status) {
        List<CorrectionRequest> list = status != null ? correctionRepository.findByStatus(status) : correctionRepository.findAll();
        return list.stream().map(this::toView).toList();
    }

    public CorrectionRequest review(Long id, String reviewerUsername, boolean approve, String comment) {
        CorrectionRequest correction = correctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Correction request not found"));
        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (correction.getStatus() != CorrectionStatus.PENDING) {
            throw new BadRequestException("Correction request already reviewed");
        }

        correction.setStatus(approve ? CorrectionStatus.APPROVED : CorrectionStatus.REJECTED);
        correction.setReviewedBy(reviewer);
        correction.setReviewComment(comment);
        correction.setReviewedAt(LocalDateTime.now());

        if (approve) {
            AttendanceRecord record = correction.getAttendanceRecord();
            boolean wasAbsent = record.getStatus() == AttendanceStatus.ABSENT;
            record.setStatus(correction.getNewStatus());
            record.setUpdatedAt(LocalDateTime.now());
            recordRepository.save(record);

            boolean isAbsentNow = correction.getNewStatus() == AttendanceStatus.ABSENT;
            if (isAbsentNow && !wasAbsent) {
                emailService.sendAbsenceNotification(record);
            }
        }

        return correctionRepository.save(correction);
    }

    private CorrectionView toView(CorrectionRequest c) {
        AttendanceRecord record = c.getAttendanceRecord();
        return new CorrectionView(
                c.getId(),
                record.getId(),
                record.getStudent().getName(),
                record.getSession().getSectionSubjectFaculty().getSubject().getName(),
                c.getOldStatus(),
                c.getNewStatus(),
                c.getReason(),
                c.getStatus(),
                c.getRequestedBy().getUsername(),
                c.getReviewedBy() != null ? c.getReviewedBy().getUsername() : null,
                c.getReviewComment(),
                c.getCreatedAt()
        );
    }
}
