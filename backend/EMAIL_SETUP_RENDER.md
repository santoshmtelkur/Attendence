# Email setup on Render

The backend already contains automatic absence-email logic. When a faculty member submits attendance and a student changes to **ABSENT**, the backend sends an email to the student's email address and, when present, a parent/guardian email. The same notification is sent when an approved correction changes a student's status to ABSENT.

## Render environment variables

For Gmail SMTP, set these on the `attendance-backend` service:

- `MAIL_ENABLED=true`
- `MAIL_HOST=smtp.gmail.com`
- `MAIL_PORT=587`
- `MAIL_USERNAME=your-gmail-address`
- `MAIL_PASSWORD=your-16-character-gmail-app-password`
- `MAIL_FROM=your-gmail-address` (recommended; it must be a sender Gmail allows)

Do **not** put the App Password in source code or commit it to GitHub.

The production profile defaults email sending to enabled, but an explicitly configured Render `MAIL_ENABLED=false` still disables it.

## Build/deployment safety

- `spring-boot-starter-mail` is included in `pom.xml`.
- Attendance email calls pass plain values, not JPA entities, into the async mail service.
- Email failures are logged and do not roll back the attendance save.
- `CorrectionService` uses the same six-argument `sendAbsenceNotification(...)` signature as `EmailService`, avoiding the previous compilation mismatch.
