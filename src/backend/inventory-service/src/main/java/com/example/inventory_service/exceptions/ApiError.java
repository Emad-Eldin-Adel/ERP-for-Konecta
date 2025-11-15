package com.example.inventory_service.exceptions;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors
) {
    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path, null);
    }

    public ApiError withValidationErrors(Map<String, String> errors) {
        return new ApiError(timestamp, status, error, message, path, errors);
    }
}