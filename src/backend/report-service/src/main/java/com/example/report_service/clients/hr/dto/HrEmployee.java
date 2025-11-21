package com.example.report_service.clients.hr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HrEmployee(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String position,
        LocalDate hireDate,
        Double salary,
        Double workingHours,
        Long departmentId,
        String departmentName) {

    public String displayName() {
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        String full = (first + " " + last).trim();
        if (full.isEmpty()) {
            return email != null ? email : "Employee #" + id;
        }
        return full;
    }
}
