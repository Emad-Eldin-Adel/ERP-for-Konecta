package com.example.hr_service.dtos.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String position;
    private LocalDate hireDate;
    private Double salary;
    private Double workingHours;
    private Long departmentId;
}