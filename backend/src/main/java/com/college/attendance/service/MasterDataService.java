package com.college.attendance.service;

import com.college.attendance.dto.MasterDataDtos.*;
import com.college.attendance.entity.*;
import com.college.attendance.exception.BadRequestException;
import com.college.attendance.exception.ResourceNotFoundException;
import com.college.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MasterDataService {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final ClassSectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final SectionSubjectFacultyRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ---------- Departments ----------
    public List<Department> listDepartments() {
        return departmentRepository.findAll();
    }

    public Department createDepartment(DepartmentRequest req) {
        Department d = new Department(null, req.name(), req.code());
        return departmentRepository.save(d);
    }

    // ---------- Sections ----------
    public List<ClassSection> listSections() {
        return sectionRepository.findAll();
    }

    public ClassSection createSection(SectionRequest req) {
        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        ClassSection s = new ClassSection(null, req.name(), req.semester(), req.academicYear(), dept);
        return sectionRepository.save(s);
    }

    // ---------- Subjects ----------
    public List<Subject> listSubjects() {
        return subjectRepository.findAll();
    }

    public Subject createSubject(SubjectRequest req) {
        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        Subject s = new Subject(null, req.name(), req.code(), dept);
        return subjectRepository.save(s);
    }

    // ---------- Faculty ----------
    public List<Faculty> listFaculty() {
        return facultyRepository.findAll();
    }

    public Faculty createFaculty(FacultyRequest req) {
        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        Faculty faculty = new Faculty(null, req.name(), req.email(), req.employeeCode(), dept);
        faculty = facultyRepository.save(faculty);

        String username = (req.username() != null && !req.username().isBlank()) ? req.username() : req.email();
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username already taken: " + username);
        }
        String rawPassword = (req.password() != null && !req.password().isBlank()) ? req.password() : "password123";
        User user = new User(null, username, passwordEncoder.encode(rawPassword), req.email(), Role.FACULTY, true, null, faculty);
        userRepository.save(user);
        return faculty;
    }

    // ---------- Students ----------
    public List<Student> listStudents() {
        return studentRepository.findAll();
    }

    public List<Student> listStudentsBySection(Long sectionId) {
        return studentRepository.findBySectionId(sectionId);
    }

    public Student createStudent(StudentRequest req) {
        Department dept = departmentRepository.findById(req.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        ClassSection section = sectionRepository.findById(req.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        Student student = new Student(null, req.rollNumber(), req.name(), req.email(),
                req.parentEmail(), req.phone(), dept, section);
        student = studentRepository.save(student);

        String username = (req.username() != null && !req.username().isBlank()) ? req.username() : req.rollNumber();
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username already taken: " + username);
        }
        String rawPassword = (req.password() != null && !req.password().isBlank()) ? req.password() : "password123";
        User user = new User(null, username, passwordEncoder.encode(rawPassword), req.email(), Role.STUDENT, true, student, null);
        userRepository.save(user);
        return student;
    }

    // ---------- Assignments (which faculty teaches which subject to which section) ----------
    public List<SectionSubjectFaculty> listAssignments() {
        return assignmentRepository.findAll();
    }

    public SectionSubjectFaculty createAssignment(AssignmentRequest req) {
        ClassSection section = sectionRepository.findById(req.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Faculty faculty = facultyRepository.findById(req.facultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        SectionSubjectFaculty mapping = new SectionSubjectFaculty(null, section, subject, faculty);
        return assignmentRepository.save(mapping);
    }

    public List<SectionSubjectFaculty> listAssignmentsForFaculty(Long facultyId) {
        return assignmentRepository.findByFacultyId(facultyId);
    }
}
