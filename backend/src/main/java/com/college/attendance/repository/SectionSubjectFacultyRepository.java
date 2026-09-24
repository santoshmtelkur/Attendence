package com.college.attendance.repository;

import com.college.attendance.entity.SectionSubjectFaculty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionSubjectFacultyRepository extends JpaRepository<SectionSubjectFaculty, Long> {
    List<SectionSubjectFaculty> findByFacultyId(Long facultyId);
    List<SectionSubjectFaculty> findBySectionId(Long sectionId);
}
