package com.example.report_service.clients.auth;

public record LoginResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String token) {
}
