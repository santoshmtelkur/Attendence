package com.college.attendance.service;

import com.college.attendance.entity.AttendanceRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");

    /**
     * Sends an immediate notification when a student is marked ABSENT.
     *
     * The attendance transaction passes only plain values to this async method.
     * Passing JPA entities into @Async can make another thread access lazy
     * Hibernate proxies while the original transaction is still running.
     */
    @Async
    public void sendAbsenceNotification(String studentName, String studentEmail, String parentEmail,
                                        String subjectName, String sessionDate, int period) {
        String subjectLine = "Attendance Alert: Marked Absent - " + subjectName;
        String body = String.format(
                "Dear %s,%n%n" +
                "You have been marked ABSENT for the following class:%n%n" +
                "  Subject : %s%n" +
                "  Date    : %s%n" +
                "  Period  : %d%n%n" +
                "If you believe this is incorrect, please contact your faculty to raise a correction request.%n%n" +
                "Regards,%n" +
                "College Attendance System",
                studentName, subjectName, sessionDate, period
        );

        sendMail(studentEmail, subjectLine, body);
        if (parentEmail != null && !parentEmail.isBlank()) {
            sendMail(parentEmail, subjectLine + " (Parent Copy)", body);
        }
    }

    /**
     * Weekly / on-demand digest for students whose overall attendance has fallen below the threshold.
     */
    @Async
    public void sendLowAttendanceDigest(String toEmail, String studentName, double percentage, double threshold, List<String> subjectBreakdownLines) {
        String subjectLine = "Low Attendance Warning - " + String.format("%.1f%%", percentage);
        StringBuilder body = new StringBuilder();
        body.append(String.format(
                "Dear %s,%n%n" +
                "Your overall attendance has dropped to %.1f%%, which is below the required minimum of %.1f%%.%n%n",
                studentName, percentage, threshold));

        if (!subjectBreakdownLines.isEmpty()) {
            body.append("Subject-wise attendance:%n".formatted());
            subjectBreakdownLines.forEach(line -> body.append("  - ").append(line).append(System.lineSeparator()));
            body.append(System.lineSeparator());
        }

        body.append("Please improve your attendance to avoid being debarred from examinations. ")
            .append("Contact your class coordinator if you have any questions.")
            .append(System.lineSeparator()).append(System.lineSeparator())
            .append("Regards,").append(System.lineSeparator()).append("College Attendance System");

        sendMail(toEmail, subjectLine, body.toString());
    }

    private void sendMail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Would send to {}: {}\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
