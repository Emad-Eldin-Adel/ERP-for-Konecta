package com.example.hr_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OffboardingResponse {
    private Long employeeId;
    private String status; // INITIATED, IN_PROGRESS, CLEARED, COMPLETED
    private LocalDate lastWorkingDay;
    private LocalDateTime interviewAt;
    private String clearanceFormUrl;
    private String experienceLetterUrl;
}