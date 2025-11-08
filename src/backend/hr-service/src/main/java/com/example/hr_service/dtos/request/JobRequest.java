package com.example.hr_service.dtos.request;

import lombok.Data;

@Data
public class JobRequest {
    private String title;
    private String description;
    private Long departmentId; // optional
    private String location;
    private String employmentType;
    private String status; // OPEN | CLOSED | DRAFT (optional on create)
}