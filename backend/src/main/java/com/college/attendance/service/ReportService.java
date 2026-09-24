package com.college.attendance.service;

import com.college.attendance.dto.AttendanceDtos.*;
import com.college.attendance.entity.Student;
import com.college.attendance.entity.Subject;
import com.college.attendance.exception.ResourceNotFoundException;
import com.college.attendance.repository.AttendanceRecordRepository;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceRecordRepository recordRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public StudentAttendanceSummary studentSummary(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        long present = recordRepository.countPresentForStudent(studentId);
        long total = recordRepository.countTotalForStudent(studentId);
        double pct = total == 0 ? 100.0 : (present * 100.0) / total;

        Map<Long, Long> presentBySubject = new HashMap<>();
        recordRepository.countPresentBySubjectForStudent(studentId)
                .forEach(row -> presentBySubject.put((Long) row[0], (Long) row[1]));

        Map<Long, Long> totalBySubject = new HashMap<>();
        recordRepository.countTotalBySubjectForStudent(studentId)
                .forEach(row -> totalBySubject.put((Long) row[0], (Long) row[1]));

        List<SubjectSummary> subjectSummaries = totalBySubject.entrySet().stream()
                .map(e -> {
                    Subject subject = subjectRepository.findById(e.getKey()).orElse(null);
                    long p = presentBySubject.getOrDefault(e.getKey(), 0L);
                    long t = e.getValue();
                    double subPct = t == 0 ? 100.0 : (p * 100.0) / t;
                    return new SubjectSummary(e.getKey(), subject != null ? subject.getName() : "Unknown", p, t, round1(subPct));
                }).toList();

        return new StudentAttendanceSummary(student.getId(), student.getRollNumber(), student.getName(),
                present, total, round1(pct), subjectSummaries);
    }

    public List<LowAttendanceRow> lowAttendance(double threshold) {
        Map<Long, Long> present = new HashMap<>();
        recordRepository.countPresentPerStudent().forEach(row -> present.put((Long) row[0], (Long) row[1]));

        Map<Long, Long> total = new HashMap<>();
        recordRepository.countTotalPerStudent().forEach(row -> total.put((Long) row[0], (Long) row[1]));

        return total.entrySet().stream()
                .map(e -> {
                    Student student = studentRepository.findById(e.getKey()).orElse(null);
                    if (student == null) return null;
                    long p = present.getOrDefault(e.getKey(), 0L);
                    long t = e.getValue();
                    double pct = t == 0 ? 100.0 : (p * 100.0) / t;
                    return new LowAttendanceRow(student.getId(), student.getRollNumber(), student.getName(),
                            student.getEmail(),
                            student.getSection() != null ? student.getSection().getName() : "-",
                            p, t, round1(pct));
                })
                .filter(row -> row != null && row.percentage() < threshold)
                .sorted((a, b) -> Double.compare(a.percentage(), b.percentage()))
                .toList();
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
