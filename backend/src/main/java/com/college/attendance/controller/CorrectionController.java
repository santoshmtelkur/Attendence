package com.college.attendance.controller;

import com.college.attendance.dto.CorrectionDtos.*;
import com.college.attendance.entity.CorrectionRequest;
import com.college.attendance.entity.CorrectionStatus;
import com.college.attendance.service.CorrectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/corrections")
@RequiredArgsConstructor
public class CorrectionController {

    private final CorrectionService correctionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public CorrectionRequest create(Authentication auth, @Valid @RequestBody CreateCorrectionRequest req) {
        return correctionService.create(auth.getName(), req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<CorrectionView> list(@RequestParam(required = false) CorrectionStatus status) {
        return correctionService.listByStatus(status);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public CorrectionRequest approve(Authentication auth, @PathVariable Long id, @RequestBody(required = false) ReviewRequest req) {
        return correctionService.review(id, auth.getName(), true, req != null ? req.comment() : null);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public CorrectionRequest reject(Authentication auth, @PathVariable Long id, @RequestBody(required = false) ReviewRequest req) {
        return correctionService.review(id, auth.getName(), false, req != null ? req.comment() : null);
    }
}
