package com.example.auth_service.dto;

import com.example.auth_service.models.Role;

public record LoginResponse(
        String token,
        Long id,
        String email,
        String fullName,
        Role role
) {
}
