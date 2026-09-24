package com.college.attendance.repository;

import com.college.attendance.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findBySectionSubjectFacultyIdAndSessionDate(Long sectionSubjectFacultyId, LocalDate date);
    Optional<AttendanceSession> findBySectionSubjectFacultyIdAndSessionDateAndPeriod(Long sectionSubjectFacultyId, LocalDate date, Integer period);
    List<AttendanceSession> findBySectionSubjectFacultyFacultyId(Long facultyId);
}
