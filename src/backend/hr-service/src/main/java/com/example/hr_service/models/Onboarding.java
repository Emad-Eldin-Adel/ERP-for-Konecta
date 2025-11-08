package com.example.hr_service.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "onboarding")
public class Onboarding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long employeeId;
    private String status; // INITIATED, IN_PROGRESS, COMPLETED
    private LocalDate startDate;
    private LocalDate completedAt;
}