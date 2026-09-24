package com.college.attendance.controller;

import com.college.attendance.dto.MasterDataDtos.*;
import com.college.attendance.entity.*;
import com.college.attendance.service.MasterDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    // Departments
    @GetMapping("/departments")
    public List<Department> departments() {
        return masterDataService.listDepartments();
    }

    @PostMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public Department createDepartment(@Valid @RequestBody DepartmentRequest req) {
        return masterDataService.createDepartment(req);
    }

    // Sections
    @GetMapping("/sections")
    public List<ClassSection> sections() {
        return masterDataService.listSections();
    }

    @PostMapping("/sections")
    @PreAuthorize("hasRole('ADMIN')")
    public ClassSection createSection(@Valid @RequestBody SectionRequest req) {
        return masterDataService.createSection(req);
    }

    // Subjects
    @GetMapping("/subjects")
    public List<Subject> subjects() {
        return masterDataService.listSubjects();
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public Subject createSubject(@Valid @RequestBody SubjectRequest req) {
        return masterDataService.createSubject(req);
    }

    // Faculty
    @GetMapping("/faculty")
    public List<Faculty> faculty() {
        return masterDataService.listFaculty();
    }

    @PostMapping("/faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public Faculty createFaculty(@Valid @RequestBody FacultyRequest req) {
        return masterDataService.createFaculty(req);
    }

    // Students
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<Student> students(@RequestParam(required = false) Long sectionId) {
        return sectionId != null ? masterDataService.listStudentsBySection(sectionId) : masterDataService.listStudents();
    }

    @PostMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public Student createStudent(@Valid @RequestBody StudentRequest req) {
        return masterDataService.createStudent(req);
    }

    // Assignments (section + subject + faculty)
    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<SectionSubjectFaculty> assignments(@RequestParam(required = false) Long facultyId) {
        return facultyId != null ? masterDataService.listAssignmentsForFaculty(facultyId) : masterDataService.listAssignments();
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public SectionSubjectFaculty createAssignment(@Valid @RequestBody AssignmentRequest req) {
        return masterDataService.createAssignment(req);
    }
}
