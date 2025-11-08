package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OffboardingRequest {
    private Long employeeId;
    private LocalDate lastWorkingDay; // initiate
    private LocalDateTime interviewAt; // interview
    private String interviewer;
}