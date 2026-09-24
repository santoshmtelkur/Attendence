package com.college.attendance.repository;

import com.college.attendance.entity.ClassSection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassSectionRepository extends JpaRepository<ClassSection, Long> {
}
