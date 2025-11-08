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
public class TrainingResponse {
    private Long id;
    private String type; // PROGRAM | NOMINATION | FEEDBACK | CERTIFICATE

    // Program
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String instructor;
    private String location;

    // Nomination / Feedback / Certificate
    private Long employeeId;
    private Long programId;
    private Integer rating;
    private String feedback;
    private String certificateId;
    private LocalDateTime issuedAt;
    private String url;
}