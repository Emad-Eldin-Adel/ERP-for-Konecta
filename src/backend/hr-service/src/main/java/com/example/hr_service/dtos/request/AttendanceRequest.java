package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceRequest {
    private Long employeeId;
    private LocalDate date;
    private Boolean present;
    private Double workingHours;
}