package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TrainingRequest {
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
}