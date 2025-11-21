package com.example.report_service.clients.hr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HrTraining(
        Long id,
        String type,
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String instructor,
        String location,
        Long employeeId,
        Long programId,
        Integer rating,
        String feedback,
        String certificateId,
        LocalDateTime issuedAt,
        String url) {
}
