package com.example.hr_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingResponse {
    private Long employeeId;
    private String status; // INITIATED, IN_PROGRESS, COMPLETED
    private LocalDate startDate;
    private LocalDate completedAt;
}