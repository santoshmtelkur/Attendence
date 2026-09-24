package com.college.attendance.dto;

import com.college.attendance.entity.Role;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record LoginResponse(String token, String username, Role role, Long profileId, String name) {}
}
