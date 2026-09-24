package com.college.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Assignment: which faculty teaches which subject to which class section.
 * Attendance is always recorded against one of these assignments.
 */
@Entity
@Table(name = "section_subject_faculty", uniqueConstraints = @UniqueConstraint(columnNames = {"section_id", "subject_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionSubjectFaculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private ClassSection section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;
}
