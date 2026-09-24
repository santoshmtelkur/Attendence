package com.college.attendance.repository;

import com.college.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findBySessionId(Long sessionId);

    Optional<AttendanceRecord> findBySessionIdAndStudentId(Long sessionId, Long studentId);

    List<AttendanceRecord> findByStudentIdOrderBySessionSessionDateDesc(Long studentId);

    @Query("select r.session.sectionSubjectFaculty.subject.id, count(r) " +
            "from AttendanceRecord r where r.student.id = :studentId and r.status = 'PRESENT' " +
            "group by r.session.sectionSubjectFaculty.subject.id")
    List<Object[]> countPresentBySubjectForStudent(@Param("studentId") Long studentId);

    @Query("select r.session.sectionSubjectFaculty.subject.id, count(r) " +
            "from AttendanceRecord r where r.student.id = :studentId " +
            "group by r.session.sectionSubjectFaculty.subject.id")
    List<Object[]> countTotalBySubjectForStudent(@Param("studentId") Long studentId);

    @Query("select r.student.id, count(r) from AttendanceRecord r where r.status = 'PRESENT' group by r.student.id")
    List<Object[]> countPresentPerStudent();

    @Query("select r.student.id, count(r) from AttendanceRecord r group by r.student.id")
    List<Object[]> countTotalPerStudent();

    @Query("select count(r) from AttendanceRecord r where r.student.id = :studentId and r.status = 'PRESENT'")
    long countPresentForStudent(@Param("studentId") Long studentId);

    @Query("select count(r) from AttendanceRecord r where r.student.id = :studentId")
    long countTotalForStudent(@Param("studentId") Long studentId);
}
