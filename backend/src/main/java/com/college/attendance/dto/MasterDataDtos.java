package com.college.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MasterDataDtos {

    public record DepartmentRequest(@NotBlank String name, @NotBlank String code) {}

    public record FacultyRequest(@NotBlank String name, @NotBlank String email, String employeeCode,
                                  @NotNull Long departmentId, String username, String password) {}

    public record SectionRequest(@NotBlank String name, @NotNull Integer semester,
                                  @NotBlank String academicYear, @NotNull Long departmentId) {}

    public record SubjectRequest(@NotBlank String name, @NotBlank String code, @NotNull Long departmentId) {}

    public record StudentRequest(@NotBlank String rollNumber, @NotBlank String name, @NotBlank String email,
                                  String parentEmail, String phone, @NotNull Long departmentId,
                                  @NotNull Long sectionId, String username, String password) {}

    public record AssignmentRequest(@NotNull Long sectionId, @NotNull Long subjectId, @NotNull Long facultyId) {}
}
