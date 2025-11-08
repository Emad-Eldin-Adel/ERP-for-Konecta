package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PerformanceRequest {
    private Long employeeId;
    private Integer rating;
    private String feedback;
    private LocalDate reviewDate;
}