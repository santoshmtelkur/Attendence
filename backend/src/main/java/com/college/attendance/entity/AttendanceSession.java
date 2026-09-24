package com.college.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A single held class (a "period") for which attendance is taken once.
 */
@Entity
@Table(name = "attendance_sessions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"section_subject_faculty_id", "session_date", "period"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_subject_faculty_id", nullable = false)
    private SectionSubjectFaculty sectionSubjectFaculty;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private Integer period; // 1..8

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean locked = false; // locked sessions require a correction request to change
}
