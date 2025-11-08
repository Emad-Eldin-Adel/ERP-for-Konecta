package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RecruitmentRequest {
    // For job creation
    private String title;
    private Long departmentId;
    private String description;
    private String location;
    private String employmentType;

    // For applications
    private Long jobId;
    private String fullName;
    private String email;
    private String phone;
    private String resumeUrl;
    private String coverLetter;

    // For interview schedule
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private String interviewer;
    private String mode;

    // For offer
    private Double salary;
    private LocalDate startDate;
    private String notes;
    private String status;
}