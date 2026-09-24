package com.college.attendance.service;

import com.college.attendance.config.AppUserPrincipal;
import com.college.attendance.config.JwtUtil;
import com.college.attendance.dto.AuthDtos.LoginRequest;
import com.college.attendance.dto.AuthDtos.LoginResponse;
import com.college.attendance.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        Long profileId = switch (user.getRole()) {
            case STUDENT -> user.getStudent() != null ? user.getStudent().getId() : null;
            case FACULTY -> user.getFaculty() != null ? user.getFaculty().getId() : null;
            case ADMIN -> null;
        };

        String name = switch (user.getRole()) {
            case STUDENT -> user.getStudent() != null ? user.getStudent().getName() : user.getUsername();
            case FACULTY -> user.getFaculty() != null ? user.getFaculty().getName() : user.getUsername();
            case ADMIN -> "Administrator";
        };

        return new LoginResponse(token, user.getUsername(), user.getRole(), profileId, name);
    }
}
