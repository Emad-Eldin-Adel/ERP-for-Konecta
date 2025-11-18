package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;
import com.example.hr_service.models.LeaveType;

@Data
public class LeaveRequestDTO {
    private Long employeeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveType leaveType;
}
