package com.college.attendance.config;

import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * Seeds a small, realistic demo dataset the first time the app starts against an empty database.
 * Safe to run against H2 (local) or Postgres (prod/docker) since it goes through JPA, not raw SQL.
 * Disable with SEED_DEMO_DATA=false once you have real institutional data.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final ClassSectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final SectionSubjectFacultyRepository assignmentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    private static final String[] STUDENT_NAMES = {
            "Aarav Mehta", "Diya Patel", "Rohan Iyer", "Ishita Sharma",
            "Kabir Singh", "Ananya Gupta", "Vivaan Reddy", "Sneha Joshi"
    };

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Demo data seeding disabled (SEED_DEMO_DATA=false)");
            return;
        }
        if (departmentRepository.count() > 0) {
            log.info("Database already has data; skipping demo seed");
            return;
        }

        log.info("Seeding demo data...");

        Department cse = departmentRepository.save(new Department(null, "Computer Science & Engineering", "CSE"));
        departmentRepository.save(new Department(null, "Electronics & Communication", "ECE"));
        departmentRepository.save(new Department(null, "Mechanical Engineering", "MECH"));

        ClassSection sectionA = sectionRepository.save(new ClassSection(null, "A", 3, "2026-27", cse));
        sectionRepository.save(new ClassSection(null, "B", 3, "2026-27", cse));

        Subject dataStructures = subjectRepository.save(new Subject(null, "Data Structures", "CS301", cse));
        Subject dbms = subjectRepository.save(new Subject(null, "Database Systems", "CS302", cse));

        Faculty anita = facultyRepository.save(new Faculty(null, "Dr. Anita Rao", "anita.rao@college.edu", "EMP001", cse));
        Faculty vikram = facultyRepository.save(new Faculty(null, "Prof. Vikram Shah", "vikram.shah@college.edu", "EMP002", cse));

        userRepository.save(new User(null, "admin", passwordEncoder.encode("admin123"),
                "admin@college.edu", Role.ADMIN, true, null, null));
        userRepository.save(new User(null, "anita.rao", passwordEncoder.encode("password123"),
                "anita.rao@college.edu", Role.FACULTY, true, null, anita));
        userRepository.save(new User(null, "vikram.shah", passwordEncoder.encode("password123"),
                "vikram.shah@college.edu", Role.FACULTY, true, null, vikram));

        SectionSubjectFaculty assignment = assignmentRepository.save(
                new SectionSubjectFaculty(null, sectionA, dataStructures, anita));
        assignmentRepository.save(new SectionSubjectFaculty(null, sectionA, dbms, vikram));

        Student[] students = new Student[STUDENT_NAMES.length];
        for (int i = 0; i < STUDENT_NAMES.length; i++) {
            String name = STUDENT_NAMES[i];
            String roll = String.format("CSE21%03d", i + 1);
            String email = name.toLowerCase().replace(" ", ".") + "@students.college.edu";
            String parentEmail = name.toLowerCase().replace(" ", ".") + ".parent@gmail.com";

            Student student = studentRepository.save(
                    new Student(null, roll, name, email, parentEmail, "90000000" + String.format("%02d", i + 1), cse, sectionA));
            students[i] = student;

            userRepository.save(new User(null, roll, passwordEncoder.encode("password123"),
                    email, Role.STUDENT, true, student, null));
        }

        seedAttendanceHistory(assignment, students);

        log.info("Demo data seeded: 3 departments, 2 sections, 2 subjects, 2 faculty, {} students.", students.length);
        log.info("Login with admin/admin123, anita.rao/password123, or any roll number (e.g. CSE21001) / password123");
    }

    /**
     * Creates 10 past sessions of Data Structures for Section CSE-3-A with a realistic
     * attendance spread, so the low-attendance report and student dashboards have data
     * to show immediately.
     */
    private void seedAttendanceHistory(SectionSubjectFaculty assignment, Student[] students) {
        double[] targetPresenceRate = {0.95, 0.60, 0.72, 0.88, 0.50, 0.90, 0.68, 1.0};
        Random random = new Random(42);

        LocalDate day = LocalDate.now().minusDays(1);
        int sessionsCreated = 0;
        while (sessionsCreated < 10) {
            if (day.getDayOfWeek().getValue() <= 5) {
                AttendanceSession session = sessionRepository.save(
                        new AttendanceSession(null, assignment, day, 1, LocalDateTime.now(), true));

                for (int i = 0; i < students.length; i++) {
                    boolean present = random.nextDouble() < targetPresenceRate[i];
                    AttendanceStatus status = present ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
                    recordRepository.save(new AttendanceRecord(
                            null, session, students[i], status, null, LocalDateTime.now(), null));
                }
                sessionsCreated++;
            }
            day = day.minusDays(1);
        }
    }
}
