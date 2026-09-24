package com.college.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Represents a class/section such as "CSE-3-A" (Department + Semester + Section name).
 */
@Entity
@Table(name = "class_sections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "A"

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String academicYear; // e.g. "2026-27"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}
