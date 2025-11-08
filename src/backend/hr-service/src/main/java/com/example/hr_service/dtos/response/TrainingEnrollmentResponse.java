package com.example.hr_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingEnrollmentResponse {
    private Long id;
    private Long programId;
    private String programTitle;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String status;
    private LocalDateTime enrolledAt;
}