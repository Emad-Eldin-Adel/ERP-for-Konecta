package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AttendanceRequest {
    private Long employeeId;
    private LocalDate date;
    private Boolean present;
    private Double workingHours;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;
}
