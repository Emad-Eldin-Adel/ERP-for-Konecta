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
public class RecruitmentResponse {
    private Long id;
    private String type; // JOB | APPLICATION | INTERVIEW | OFFER

    // Job
    private String title;
    private Long departmentId;
    private String description;
    private String location;
    private String employmentType;

    // Application
    private Long jobId;
    private String fullName;
    private String email;
    private String phone;
    private String status;

    // Interview
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private String interviewer;
    private String mode;

    // Offer
    private Double salary;
    private LocalDate startDate;
}