package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "offboarding")
public class Offboarding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long employeeId;
    private String status; // INITIATED, IN_PROGRESS, CLEARED, COMPLETED
    private LocalDate lastWorkingDay;
    private LocalDateTime interviewAt;
    private String clearanceFormUrl;
    private String experienceLetterUrl;
}