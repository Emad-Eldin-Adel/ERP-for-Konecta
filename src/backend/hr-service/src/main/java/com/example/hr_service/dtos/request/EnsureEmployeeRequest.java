package com.example.hr_service.dtos.request;

import lombok.Data;

@Data
public class EnsureEmployeeRequest {
    private String email;
    private String fullName;
    private String phone;
    private String position;
    private Long departmentId;
    private Double salary;
    private Double workingHours;
}