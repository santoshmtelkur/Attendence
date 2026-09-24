package com.college.attendance.repository;

import com.college.attendance.entity.ClassSection;
import com.college.attendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findBySection(ClassSection section);
    List<Student> findBySectionId(Long sectionId);
}
