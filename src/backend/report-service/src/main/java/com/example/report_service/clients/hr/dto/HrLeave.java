package com.example.report_service.clients.hr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HrLeave(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeEmail,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        String status,
        String leaveType) {
}
