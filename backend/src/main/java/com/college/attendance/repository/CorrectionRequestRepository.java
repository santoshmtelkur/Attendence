package com.college.attendance.repository;

import com.college.attendance.entity.CorrectionRequest;
import com.college.attendance.entity.CorrectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CorrectionRequestRepository extends JpaRepository<CorrectionRequest, Long> {
    List<CorrectionRequest> findByStatus(CorrectionStatus status);
    List<CorrectionRequest> findByRequestedById(Long userId);
}
