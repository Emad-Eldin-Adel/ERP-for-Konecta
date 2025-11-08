package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class OnboardingRequest {
    private Long employeeId;
    private LocalDate startDate;
}