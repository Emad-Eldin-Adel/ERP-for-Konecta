package com.example.report_service.clients.hr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HrDepartment(
        Long id,
        String name,
        String description) {
}
